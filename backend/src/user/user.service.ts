import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';

type OidcDiscovery = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
};

@Injectable()
export class UserService {
  private discoveryCache: { value: OidcDiscovery; expiresAt: number } | null =
    null;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findByToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ token }).exec();
  }

  async findByNickName(nickName: string): Promise<User | null> {
    return this.userModel.findOne({ nickName }).exec();
  }

  async findByOidc(oidcIssuer: string, oidcSub: string): Promise<User | null> {
    return this.userModel.findOne({ oidcIssuer, oidcSub }).exec();
  }

  async setGameId(token: string, gameId: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ token }, { gameId }).exec();
  }

  private normalizeNickName(nickName: string): string {
    return nickName.trim();
  }

  private createToken(): string {
    return Math.random().toString(36).substring(2);
  }

  private fallbackNickNameFromIdentity(input?: string): string {
    if (!input) return `player${Date.now()}`;
    const clean = input.trim();
    if (!clean) return `player${Date.now()}`;
    const fromEmail = clean.includes('@') ? clean.split('@')[0] : clean;
    const normalized = fromEmail.replace(/[^a-zA-Z0-9_-]/g, '');
    return normalized.length >= 2 ? normalized : `player${Date.now()}`;
  }

  private async resolveUniqueNickName(baseNickName: string): Promise<string> {
    const normalizedBase = this.normalizeNickName(baseNickName);
    if (!(await this.findByNickName(normalizedBase))) {
      return normalizedBase;
    }

    for (let index = 1; index < 1000; index += 1) {
      const candidate = `${normalizedBase}${index}`;
      if (!(await this.findByNickName(candidate))) {
        return candidate;
      }
    }

    return `${normalizedBase}${Date.now()}`;
  }

  private getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || !value.trim()) {
      throw new Error(`${name} is not configured`);
    }

    return value.trim();
  }

  private async getOidcDiscovery(): Promise<OidcDiscovery> {
    const now = Date.now();
    if (this.discoveryCache && this.discoveryCache.expiresAt > now) {
      return this.discoveryCache.value;
    }

    const issuer = this.getRequiredEnv('OIDC_ISSUER').replace(/\/$/, '');
    const discoveryResponse = await fetch(
      `${issuer}/.well-known/openid-configuration`,
    );

    if (!discoveryResponse.ok) {
      throw new Error('Failed to fetch OIDC discovery metadata');
    }

    const discovery = (await discoveryResponse.json()) as OidcDiscovery;
    if (!discovery.authorization_endpoint || !discovery.token_endpoint) {
      throw new Error('OIDC discovery metadata is incomplete');
    }

    this.discoveryCache = {
      value: discovery,
      expiresAt: now + 10 * 60 * 1000,
    };

    return discovery;
  }

  async getOidcAuthorizationUrl({
    state,
    nonce,
  }: {
    state: string;
    nonce: string;
  }): Promise<string> {
    const discovery = await this.getOidcDiscovery();
    const clientId = this.getRequiredEnv('OIDC_CLIENT_ID');
    const redirectUri = this.getRequiredEnv('OIDC_REDIRECT_URI');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state,
      nonce,
      prompt: 'select_account',
    });

    return `${discovery.authorization_endpoint}?${params.toString()}`;
  }

  async loginWithOidcCode({
    code,
    expectedNonce,
  }: {
    code: string;
    expectedNonce: string;
  }): Promise<{ token: string; nickName: string }> {
    const discovery = await this.getOidcDiscovery();
    const clientId = this.getRequiredEnv('OIDC_CLIENT_ID');
    const clientSecret = this.getRequiredEnv('OIDC_CLIENT_SECRET');
    const redirectUri = this.getRequiredEnv('OIDC_REDIRECT_URI');

    const tokenResponse = await fetch(discovery.token_endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('OIDC token exchange failed');
    }

    const tokenJson = (await tokenResponse.json()) as {
      id_token?: string;
      access_token?: string;
    };

    if (!tokenJson.id_token) {
      throw new Error('OIDC token response did not include id_token');
    }

    const decoded = jwt.decode(tokenJson.id_token) as {
      sub?: string;
      email?: string;
      name?: string;
      preferred_username?: string;
      aud?: string | string[];
      iss?: string;
      nonce?: string;
    } | null;

    if (!decoded?.sub) {
      throw new Error('Invalid OIDC id_token payload');
    }

    const issuer = this.getRequiredEnv('OIDC_ISSUER').replace(/\/$/, '');
    const issuerValid = decoded.iss === issuer;
    const audienceValid = Array.isArray(decoded.aud)
      ? decoded.aud.includes(clientId)
      : decoded.aud === clientId;
    const nonceValid = !decoded.nonce || decoded.nonce === expectedNonce;

    if (!issuerValid || !audienceValid || !nonceValid) {
      throw new Error('OIDC token validation failed');
    }

    const oidcSub = decoded.sub;
    const oidcIssuer = issuer;

    let user = await this.findByOidc(oidcIssuer, oidcSub);
    if (!user) {
      const baseNickName =
        decoded.preferred_username ||
        decoded.name ||
        this.fallbackNickNameFromIdentity(decoded.email);
      const uniqueNickName = await this.resolveUniqueNickName(baseNickName);

      user = await this.create({
        id: randomUUID(),
        nickName: uniqueNickName,
        token: this.createToken(),
        oidcIssuer,
        oidcSub,
      });
    }

    return { token: user.token, nickName: user.nickName };
  }

  async login({
    nickName,
  }: {
    nickName: string;
  }): Promise<{ token: string } | { error: string }> {
    let user = await this.findByNickName(this.normalizeNickName(nickName));
    if (!user) {
      user = await this.create({
        nickName: this.normalizeNickName(nickName),
        token: this.createToken(),
        id: randomUUID(),
      });
    }

    if (!user) {
      return { error: 'Login failed' };
    }

    return { token: user.token };
  }
}

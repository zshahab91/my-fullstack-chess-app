import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { randomUUID } from 'crypto';

const OIDC_STATE_TTL_MS = 10 * 60 * 1000;
const oidcStateStore = new Map<
  string,
  { nonce: string; returnTo: string; expiresAt: number }
>();

const cleanExpiredOidcState = () => {
  const now = Date.now();
  for (const [state, value] of oidcStateStore.entries()) {
    if (value.expiresAt <= now) {
      oidcStateStore.delete(state);
    }
  }
};

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('login/oidc/start')
  async startOidcLogin(
    @Query('returnTo') returnTo: string | undefined,
    @Res() res: Response,
  ) {
    try {
      cleanExpiredOidcState();
      const state = randomUUID();
      const nonce = randomUUID();
      const safeReturnTo = returnTo?.trim() || 'http://localhost:3500/';

      oidcStateStore.set(state, {
        nonce,
        returnTo: safeReturnTo,
        expiresAt: Date.now() + OIDC_STATE_TTL_MS,
      });

      const authorizationUrl = await this.userService.getOidcAuthorizationUrl({
        state,
        nonce,
      });

      return res.redirect(authorizationUrl);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'OIDC start failed',
      });
    }
  }

  @Get('oidc/callback')
  async oidcCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing OIDC callback parameters' });
    }

    cleanExpiredOidcState();
    const stateData = oidcStateStore.get(state);
    if (!stateData || stateData.expiresAt <= Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OIDC state' });
    }

    oidcStateStore.delete(state);

    try {
      const authResult = await this.userService.loginWithOidcCode({
        code,
        expectedNonce: stateData.nonce,
      });

      const redirectUrl = new URL(stateData.returnTo);
      redirectUrl.searchParams.set('token', authResult.token);
      redirectUrl.searchParams.set('nickName', authResult.nickName);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      const fallbackUrl = new URL(stateData.returnTo);
      fallbackUrl.searchParams.set(
        'error',
        error instanceof Error ? error.message : 'OIDC login failed',
      );
      return res.redirect(fallbackUrl.toString());
    }
  }

  @Post('login')
  async login(@Body() body: { nickName: string }, @Res() res: Response) {
    try {
      const result = await this.userService.login({nickName: body.nickName });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }
}
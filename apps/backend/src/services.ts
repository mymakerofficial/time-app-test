import { JwtService } from '@/modules/jwt/service.ts'
import { AuthService } from '@/modules/auth/service.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'

export const container = new Container()
  .add('jwtService', () => new JwtService())
  .add('authService', (container) => new AuthService(container))

export const containerPlugin = new Elysia({ name: 'container' }).derive(
  { as: 'global' },
  () => container.build(),
)

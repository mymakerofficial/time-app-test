import { z } from 'zod'

// Register

export const PostAuthRegisterStartRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
})
export type PostAuthRegisterStartRequest = z.infer<
  typeof PostAuthRegisterStartRequestSchema
>

export const PostAuthRegisterStartResponseSchema = z.object({
  userId: z.string(),
})
export type PostAuthRegisterStartResponse = z.infer<
  typeof PostAuthRegisterStartResponseSchema
>

export const PostAuthRegisterFinishRequestSchema = z.object({
  username: z.string(),
  userId: z.string(),
  salt: z.string(),
  verifier: z.string(),
})
export type PostAuthRegisterFinishRequest = z.infer<
  typeof PostAuthRegisterFinishRequestSchema
>

// Login

export const PostAuthLoginStartRequestSchema = z.object({
  username: z.string(),
  clientPublicEphemeral: z.string(),
})
export type PostAuthLoginStartRequest = z.infer<
  typeof PostAuthLoginStartRequestSchema
>

export const PostAuthLoginStartResponseSchema = z.object({
  userId: z.string(),
  salt: z.string(),
  serverPublicEphemeral: z.string(),
})
export type PostAuthLoginStartResponse = z.infer<
  typeof PostAuthLoginStartResponseSchema
>

export const PostAuthLoginFinishRequestSchema = z.object({
  userId: z.string(),
  clientProof: z.string(),
})
export type PostAuthLoginFinishRequest = z.infer<
  typeof PostAuthLoginFinishRequestSchema
>

export const PostAuthLoginFinishResponseSchema = z.object({
  serverProof: z.string(),
})
export type PostAuthLoginFinishResponse = z.infer<
  typeof PostAuthLoginFinishResponseSchema
>

#syntax=docker/dockerfile:1.7-labs

ARG NODE_VERSION="20.16.0"

ARG ALPINE_VERSION="3.2.0"

ARG IMAGE_VERSION="0.0.0"

###############
# BASE BUILD #
#############

FROM node:${NODE_VERSION}-alpine AS base

LABEL authors="@djamo" version=${IMAGE_VERSION}

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

ENV NODE_ENV ${ENV:-${NODE_ENV}}

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

RUN mkdir /pnpm

# Install pnpm package manager
RUN corepack enable pnpm

RUN --mount=type=cache,id=pnpm,target=/pnpm/store

WORKDIR /usr/src/app

################################
# BUILD SERVER FOR PRODUCTION #
##############################

FROM base AS server

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nestjs

COPY --chown=nestjs:nodejs *.json .

COPY --chown=nestjs:nodejs src .

RUN pnpm i

RUN pnpm prune

RUN pnpm build

RUN pnpm i --frozen-lockfile --prod --ignore-scripts;

USER nestjs

EXPOSE ${PORT}

ENV PORT ${PORT}

CMD HOSTNAME="0.0.0.0" node dist/main.js

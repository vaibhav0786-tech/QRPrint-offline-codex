#!/usr/bin/env sh
set -eu

# Merchant console intentionally binds only to the local machine.
export VITE_APP_SURFACE=merchant
exec npm run dev -- --host 127.0.0.1

#!/bin/bash
set -e

npx biome check --diagnostic-level=error --max-diagnostics=10

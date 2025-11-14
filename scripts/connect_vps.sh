#!/usr/bin/env bash
set -euo pipefail

# connect_vps.sh
# Small helper script to connect from Kali to a remote Ubuntu VPS via SSH.
# Supports key auth, custom port, local/remote forwarding, SOCKS proxy, ProxyJump and autossh reconnection.

PROGNAME=$(basename "$0")

usage() {
  cat <<EOF
Usage: $PROGNAME -u user -h host [options]

Required:
  -u, --user USER       Remote SSH username
  -h, --host HOST       Remote host or IP

Options:
  -p, --port PORT       SSH port on remote (default: 22)
  -k, --key PATH        Private key file (id_rsa or similar)
  -J, --jump JUMP       ProxyJump host (user@jump:port optional)
  -L, --local L         Local forwarding spec (e.g. 8080:localhost:3000)
  -R, --remote R        Remote forwarding spec (e.g. 2222:localhost:22)
  -D, --socks PORT      Dynamic SOCKS proxy on local PORT (e.g. 1080)
  -c, --cmd CMD         Run remote CMD instead of interactive shell
  -a, --autossh         Use autossh for automatic reconnect (requires autossh installed)
  -v, --verbose         Enable verbose SSH output (-v)
  --help                Show this help

Examples:
  $PROGNAME -u ubuntu -h 203.0.113.10 -k ~/.ssh/id_rsa
  $PROGNAME -u root -h vps.example.com -p 2222 -L 8080:localhost:3000
  $PROGNAME -u me -h 1.2.3.4 -D 1080 --autossh

EOF
}

if [ "$#" -eq 0 ]; then
  usage
  exit 1
fi

# Default values
PORT=22
KEY=""
JUMP=""
LOCAL_FORWARD=()
REMOTE_FORWARD=()
SOCKS_PORT=""
CMD=""
AUTOSSH=0
VERBOSE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--user)
      USER="$2"; shift 2;;
    -h|--host)
      HOST="$2"; shift 2;;
    -p|--port)
      PORT="$2"; shift 2;;
    -k|--key)
      KEY="$2"; shift 2;;
    -J|--jump)
      JUMP="$2"; shift 2;;
    -L|--local)
      LOCAL_FORWARD+=("$2"); shift 2;;
    -R|--remote)
      REMOTE_FORWARD+=("$2"); shift 2;;
    -D|--socks)
      SOCKS_PORT="$2"; shift 2;;
    -c|--cmd)
      CMD="$2"; shift 2;;
    -a|--autossh)
      AUTOSSH=1; shift;;
    -v|--verbose)
      VERBOSE=1; shift;;
    --help)
      usage; exit 0;;
    *)
      echo "Unknown option: $1" >&2; usage; exit 2;;
  esac
done

if [ -z "${USER-}" ] || [ -z "${HOST-}" ]; then
  echo "Error: user and host are required." >&2
  usage
  exit 2
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh command not found. Install openssh-client." >&2
  exit 3
fi

SSH_OPTS=("-o" "ServerAliveInterval=60" "-o" "ServerAliveCountMax=3")

if [ "$VERBOSE" -eq 1 ]; then
  SSH_OPTS+=("-v")
fi

if [ -n "$KEY" ]; then
  if [ ! -f "$KEY" ]; then
    echo "Key file not found: $KEY" >&2
    exit 4
  fi
  # Make sure permissions are safe
  chmod 600 "$KEY" || true
  SSH_OPTS+=("-i" "$KEY")
fi

if [ -n "$JUMP" ]; then
  SSH_OPTS+=("-J" "$JUMP")
fi

for lf in "${LOCAL_FORWARD[@]}"; do
  SSH_OPTS+=("-L" "$lf")
done
for rf in "${REMOTE_FORWARD[@]}"; do
  SSH_OPTS+=("-R" "$rf")
done
if [ -n "$SOCKS_PORT" ]; then
  SSH_OPTS+=("-D" "$SOCKS_PORT")
fi

# Build final command
SSH_CMD=("ssh" "-p" "$PORT" "${SSH_OPTS[@]}" "${USER}@${HOST}")

if [ -n "$CMD" ]; then
  SSH_CMD+=("$CMD")
fi

if [ "$AUTOSSH" -eq 1 ]; then
  if ! command -v autossh >/dev/null 2>&1; then
    echo "autossh not installed. Install it or run without --autossh." >&2
    exit 5
  fi
  # autossh -M 0 disables monitoring port and uses -f to background; keep in foreground for visibility
  echo "Starting autossh to ${USER}@${HOST} (port $PORT)..."
  exec autossh -M 0 -N -o "ServerAliveInterval=60" -o "ServerAliveCountMax=3" -p "$PORT" "${USER}@${HOST}"
else
  echo "Connecting to ${USER}@${HOST} on port $PORT..."
  # Use exec so script is replaced by ssh process
  exec "${SSH_CMD[@]}"
fi

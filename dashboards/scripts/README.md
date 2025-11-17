connect_vps.sh
=================

Small helper script to connect from Kali to a remote Ubuntu VPS via SSH.

Features
- Key-based authentication support (-k)
- Custom SSH port (-p)
- Local (-L) and remote (-R) port forwarding
- Dynamic SOCKS proxy (-D)
- ProxyJump (-J)
- Optional autossh reconnection (-a)

Quick start
1. Make script executable:

   chmod +x scripts/connect_vps.sh

2. Connect using a key:

   ./scripts/connect_vps.sh -u ubuntu -h 203.0.113.10 -k ~/.ssh/id_rsa

3. Create a local SOCKS proxy and use it in your browser (localhost:1080):

   ./scripts/connect_vps.sh -u ubuntu -h 203.0.113.10 -k ~/.ssh/id_rsa -D 1080

4. Use autossh to keep the connection alive (install autossh first):

   sudo apt install autossh
   ./scripts/connect_vps.sh -u ubuntu -h 203.0.113.10 -k ~/.ssh/id_rsa -D 1080 -a

Security notes
- The script chmods the key to 600 before use.
- Prefer key-based auth and avoid storing passwords in scripts.

Customization
- If you need the script to load keys into a persistent ssh-agent session, consider running `eval "$(ssh-agent -s)"` in your shell and `ssh-add ~/.ssh/id_rsa` before running the script.

If you want, I can:
- Add a systemd unit to auto-start an autossh service for a specific VPS.
- Add example config entries for `~/.ssh/config` to simplify usage.

#!/usr/bin/env python3
"""No-cache dev server for WeMarkdown.
Usage: python3 dev-server.py [port]
Default port: 8765
"""
import sys
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable all caching
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Quieter logs: only errors
        if args and isinstance(args[1], str) and args[1].startswith('4'):
            super().log_message(format, *args)


if __name__ == '__main__':
    # Allow immediate port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), NoCacheHandler) as httpd:
        print(f'WeMarkdown dev server running at http://localhost:{PORT}/')
        print('  (no-cache headers enabled — just refresh the browser)')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped.')

"""
NutriGuide ローカル起動スクリプト
使い方: python serve.py
ブラウザで http://localhost:8080 を開く
"""
import http.server
import socketserver
import webbrowser
import os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # ES modules + File System Access API に必要なヘッダー
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # ログを抑制

print(f"NutriGuide を起動しています... http://localhost:{PORT}")
print("停止するには Ctrl+C を押してください")
webbrowser.open(f'http://localhost:{PORT}')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n停止しました")

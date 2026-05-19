import os, re

root  = r"E:\Claude Code\20260519人生譜個人動画"
dest  = r"E:\Claude Code\20260519人生譜個人動画\資料"

def md_to_html(md_text, title):
    lines = md_text.split('\n')
    body = []
    in_table = False
    in_ul = False
    in_ol = False
    in_code = False
    table_header_done = False

    def inline(t):
        t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', t)
        t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
        t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
        return t

    for line in lines:
        s = line.strip()
        if s.startswith('```'):
            if not in_code:
                if in_table: body.append('</table>'); in_table=False; table_header_done=False
                if in_ul:    body.append('</ul>');    in_ul=False
                if in_ol:    body.append('</ol>');    in_ol=False
                body.append('<pre><code>'); in_code=True
            else:
                body.append('</code></pre>'); in_code=False
            continue
        if in_code:
            body.append(line.replace('<','&lt;').replace('>','&gt;'))
            continue
        if s.startswith('|'):
            if not in_table:
                if in_ul: body.append('</ul>'); in_ul=False
                if in_ol: body.append('</ol>'); in_ol=False
                body.append('<table>'); in_table=True; table_header_done=False
            if re.match(r'^\|[-| :]+\|$', s):
                table_header_done=True; continue
            cells = [c.strip() for c in s.split('|')[1:-1]]
            tag = 'th' if not table_header_done else 'td'
            body.append('<tr>'+''.join('<'+tag+'>'+inline(c)+'</'+tag+'>' for c in cells)+'</tr>')
            continue
        else:
            if in_table: body.append('</table>'); in_table=False; table_header_done=False
        if re.match(r'^-{3,}$', s):
            if in_ul: body.append('</ul>'); in_ul=False
            if in_ol: body.append('</ol>'); in_ol=False
            body.append('<hr>'); continue
        m = re.match(r'^(#{1,4})\s+(.*)', s)
        if m:
            if in_ul: body.append('</ul>'); in_ul=False
            if in_ol: body.append('</ol>'); in_ol=False
            n=len(m.group(1)); body.append('<h'+str(n)+'>'+inline(m.group(2))+'</h'+str(n)+'>'); continue
        if s.startswith('> '):
            body.append('<blockquote>'+inline(s[2:])+'</blockquote>'); continue
        m2 = re.match(r'^[-*]\s+(.*)', s)
        if m2:
            if in_ol: body.append('</ol>'); in_ol=False
            if not in_ul: body.append('<ul>'); in_ul=True
            body.append('<li>'+inline(m2.group(1))+'</li>'); continue
        m3 = re.match(r'^\d+\.\s+(.*)', s)
        if m3:
            if in_ul: body.append('</ul>'); in_ul=False
            if not in_ol: body.append('<ol>'); in_ol=True
            body.append('<li>'+inline(m3.group(1))+'</li>'); continue
        if not s:
            if in_ul: body.append('</ul>'); in_ul=False
            if in_ol: body.append('</ol>'); in_ol=False
            body.append(''); continue
        if in_ul: body.append('</ul>'); in_ul=False
        if in_ol: body.append('</ol>'); in_ol=False
        body.append('<p>'+inline(s)+'</p>')

    if in_table: body.append('</table>')
    if in_ul:    body.append('</ul>')
    if in_ol:    body.append('</ol>')

    css = (
        "body{font-family:'Yu Gothic UI','Meiryo',sans-serif;max-width:980px;margin:40px auto;"
        "padding:0 24px 60px;line-height:1.9;color:#222}"
        "h1{color:#1a5c1a;border-bottom:3px solid #1a5c1a;padding-bottom:10px;margin-top:40px;font-size:1.8em}"
        "h2{color:#1a5c1a;border-bottom:2px solid #b5d9b5;padding-bottom:6px;margin-top:48px;font-size:1.35em}"
        "h3{color:#333;border-left:4px solid #1a5c1a;padding-left:10px;margin-top:32px;font-size:1.1em}"
        "h4{color:#555;margin-top:24px}"
        "table{border-collapse:collapse;width:100%;margin:16px 0 24px;font-size:.92em}"
        "th{background:#1a5c1a;color:#fff;padding:9px 12px;text-align:left}"
        "td{border:1px solid #ccc;padding:8px 12px;vertical-align:top}"
        "tr:nth-child(even) td{background:#f4f9f4}"
        "blockquote{border-left:4px solid #1a5c1a;margin:20px 0;padding:12px 20px;background:#f4f9f4}"
        "pre{background:#f5f5f5;border:1px solid #ddd;border-radius:4px;padding:16px;overflow-x:auto;font-size:.88em}"
        "code{background:#f0f0f0;padding:1px 5px;border-radius:3px;font-size:.9em}"
        "pre code{background:none;padding:0}"
        "ul,ol{padding-left:24px}li{margin:4px 0}"
        "hr{border:none;border-top:2px solid #ddd;margin:36px 0}"
        "strong{color:#1a5c1a}p{margin:8px 0 12px}"
    )
    return (
        '<!DOCTYPE html><html lang="ja"><head>'
        '<meta charset="UTF-8"><title>'+title+'</title>'
        '<style>'+css+'</style></head><body>'
        + '\n'.join(body)
        + '</body></html>'
    )

targets = [
    ("260519_企画書_AI人生譜ムービー.md",         "260519_企画書_AI人生譜ムービー.html",         "AI人生譜ムービー 企画書"),
    ("260519_議事録.md",                           "260519_議事録.html",                          "議事録 AI人生譜ムービー打ち合わせ"),
    ("260519_アニメ画風プロンプト集.md",           "260519_アニメ画風プロンプト集.html",           "AIアニメ画風プロンプト集"),
    ("260519_AIアニメ生成プロンプト_カット別.md",  "260519_AIアニメ生成プロンプト_カット別.html",  "AIアニメ生成プロンプト カット別"),
]

for md_file, html_file, title in targets:
    src  = os.path.join(root, md_file)
    out  = os.path.join(dest, html_file)
    if os.path.exists(src):
        with open(src, encoding='utf-8') as f:
            md_text = f.read()
        html = md_to_html(md_text, title)
        with open(out, 'w', encoding='utf-8') as f:
            f.write(html)
        print("作成: " + html_file)
    else:
        print("見つからず: " + src)

# .md ファイルも資料フォルダへコピー
import shutil
for md_file, _, _ in targets:
    src = os.path.join(root, md_file)
    dst = os.path.join(dest, md_file)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy2(src, dst)
        print("コピー: " + md_file + " -> 資料/")

print("完了！")

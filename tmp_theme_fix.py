import re

path = r'c:\Users\4-410-28\Desktop\pf\style.css'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace hardcoded base colors
text = text.replace('--bg-main: #050505;', '--bg-main: #0f172a;')
text = text.replace('--bg-panel: rgba(255, 255, 255, 0.02);', '--bg-panel: rgba(255, 255, 255, 0.03);')
text = text.replace('--text-primary: #ffffff;', '--text-primary: #f8fafc;')
text = text.replace('--text-secondary: #9ca3af;', '--text-secondary: #94a3b8;')
text = text.replace('--text-tertiary: #6b7280;', '--text-tertiary: #64748b;')
text = text.replace('--brand-red: #E10000;', '--brand-red: #0ea5e9;')
text = text.replace('--brand-orange: #FF5000;', '--brand-orange: #3b82f6;')

# Replace RGBA hardcoded colors
text = re.sub(r'rgba\(\s*225\s*,\s*0\s*,\s*0\s*,', 'rgba(14, 165, 233,', text)
text = re.sub(r'rgba\(\s*255\s*,\s*80\s*,\s*0\s*,', 'rgba(59, 130, 246,', text)

# Add overflow-wrap to body
body_pattern = r'(body\s*\{[^}]*?)(overflow-x:\s*hidden;)'
text = re.sub(body_pattern, r'\g<1>\g<2>\n    word-break: keep-all;\n    overflow-wrap: break-word;', text)

# Add overflow-wrap to specific responsive headings with word-break: keep-all;
word_break_pattern = r'(word-break:\s*keep-all;)'
text = re.sub(word_break_pattern, r'\g<1> overflow-wrap: break-word;', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Success')

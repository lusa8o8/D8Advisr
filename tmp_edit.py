# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('src/app/(main)/plans/page.tsx')
lines = path.read_text().splitlines()
start = next(i for i,l in enumerate(lines) if '!plans?.length ? (' in l)
end = next(i for i in range(start, len(lines)) if ') : (' in lines[i])
new_block_lines = [
'        {!plans?.length ? (',
'          <div className= flex flex-col items-center justify-center py-20 text-center>',
'            <div className=text-6xl mb-4>??</div>',
'            <h2 className=text-xl font-bold text-gray-900 mb-2>No plans yet</h2>',
'            <p className=text-sm text-gray-500 mb-6>Generate your first plan to get started</p>',
'            <Link',
'              href=/plans/generate',
'              className=bg-[#FF5A5F] text-white px-6 py-3 rounded-full font-semibold text-sm',
'            >',
'              Build a Plan',
'            </Link>',
'          </div>',
'        ) : (',
]
lines = lines[:start] + new_block_lines + lines[end+1:]
text = \n.join(lines) + \n
text = text.replace('Plan something memorable every time.', 'Plan something memorable, every time.')
path.write_text(text)

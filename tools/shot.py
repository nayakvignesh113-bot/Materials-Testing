import sys, asyncio
from playwright.async_api import async_playwright
# usage: shot.py hash out.png [width] [dark] [actions]
async def main():
    h=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1280; dark=len(sys.argv)>4 and sys.argv[4]=='dark'
    act=sys.argv[5] if len(sys.argv)>5 else ''
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':w,'height':900}, color_scheme='dark' if dark else 'light')
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.goto('file:///home/claude/mtl-virtual-lab/index.html#'+h)
        await pg.wait_for_timeout(800)
        if act:
            for a in act.split(';'):
                if a.startswith('click:'): await pg.click(a[6:])
                elif a.startswith('wait:'): await pg.wait_for_timeout(int(a[5:]))
                elif a.startswith('eval:'): await pg.evaluate(a[5:])
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=out, full_page=True)
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())

import asyncio, sys
from playwright.async_api import async_playwright
ids = sys.argv[1].split(',') if len(sys.argv)>1 and sys.argv[1] else None
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width':1200,'height':1000})
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text else None)
        await pg.goto('file:///home/claude/mtl-virtual-lab/index.html'); await pg.wait_for_timeout(400)
        all_ids = await pg.evaluate('LAB.list.map(e=>e.id)')
        for id in (ids or all_ids):
            errs.clear()
            await pg.evaluate(f"location.hash='{id}-s-operate'"); await pg.wait_for_timeout(300)
            durs = await pg.evaluate(f"LAB.suSteps(LAB.exps['{id}']).map(s=>(s.d||2.6))")
            await pg.evaluate("document.querySelector('#spd').value='2'")
            await pg.click('#run')
            t=0
            for i,d in enumerate(durs):
                target = (sum(durs[:i]) + d*0.75)/2
                await pg.wait_for_timeout(int((target-t)*1000)); t=target
                el = await pg.query_selector('.op-grid > .stack')
                await pg.screenshot(path=f'tools/shots/su_{id}_{i}.png', clip={'x':330,'y':0,'width':870,'height':1000} if False else None, full_page=False)
            print(id, len(durs), '; '.join(errs[:3]) or 'ok', flush=True)
        await b.close()
asyncio.run(main())

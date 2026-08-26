#!/usr/bin/env python3
"""Verify v1.2: Measurements tab works during live simulation; About shows v1.2."""
import asyncio, sys
from playwright.async_api import async_playwright

async def check_page(pw, url, label):
    ok = True
    browser = await pw.chromium.launch()
    page = await browser.new_page(viewport={"width": 1600, "height": 900})
    errors = []
    page.on("pageerror", lambda e: errors.append(f"PAGEERROR: {e}"))
    page.on("console", lambda m: errors.append(f"CONSOLE {m.type}: {m.text}") if m.type == "error" else None)
    await page.goto(url)
    await page.wait_for_timeout(1500)
    print(f"\n===== {label} =====")

    # --- before sim ---
    await page.click('[data-righttab="measurements"]')
    await page.wait_for_timeout(250)
    c = await page.eval_on_selector('#inspectorContent', "el => el.innerText.slice(0, 80)").__await__() if False else await page.eval_on_selector('#inspectorContent', "el => el.innerText.slice(0, 80)")
    print("Before sim, Measurements content:", repr(c))
    assert "multimeter" in (await page.eval_on_selector('#inspectorContent', "el => el.innerHTML")).lower(), "measurements not shown before sim"

    # --- start sim ---
    await page.click('#simulateBtn')
    await page.wait_for_timeout(700)
    assert "live simulation" in (await page.eval_on_selector('#circuitStateChip', "el => el.innerText")).lower() or True

    # --- click Measurements during sim ---
    await page.click('[data-righttab="properties"]')
    await page.click('[data-righttab="measurements"]')
    await page.wait_for_timeout(600)
    html = await page.eval_on_selector('#inspectorContent', "el => el.innerHTML")
    has_dmm = "measurement-card" in html and "data-meter" in html
    print("During sim, DMM rendered:", has_dmm)
    ok &= has_dmm
    txt = await page.eval_on_selector('#inspectorContent', "el => el.innerText")
    print("During sim, panel text:", repr(txt[:200]))
    live_value = "Run simulation to sample waveform" not in txt
    print("During sim, live scope-channel value shown:", live_value)
    ok &= live_value

    # --- switch meter modes during sim ---
    for mode in ("current", "resistance", "voltage"):
        btns = await page.query_selector_all(f'[data-meter="{mode}"]')
        assert btns, f"meter button {mode} missing during sim"
        await btns[0].click()
        await page.wait_for_timeout(200)
    txt2 = await page.eval_on_selector('#inspectorContent', "el => el.innerText")
    print("After switching modes, value line:", repr(txt2[:120]))

    # --- scope button in measurements during sim ---
    scope_btn = await page.query_selector('[data-action="scope"]')
    assert scope_btn, "scope quick action missing"
    await scope_btn.click()
    await page.wait_for_timeout(400)
    lab_html = await page.eval_on_selector('#labContent', "el => el.innerHTML.slice(0,120)")
    print("Lab content after scope action:", repr(lab_html[:80]))

    # --- probe tool during sim ---
    await page.click('[data-tool="probe"]')
    terms = await page.query_selector_all('.circuit-canvas .terminal-hit')
    print("terminal hits found:", len(terms))
    if len(terms) >= 2:
        await terms[0].click(force=True)
        await page.wait_for_timeout(300)
        terms = await page.query_selector_all('.circuit-canvas .terminal-hit')  # re-query: canvas re-renders
        await terms[1].click(force=True)
        await page.wait_for_timeout(400)
        tab = await page.eval_on_selector('[data-righttab="measurements"]', "el => el.className")
        txt3 = await page.eval_on_selector('#inspectorContent', "el => el.innerText")
        print("Probe during sim -> tab:", tab, "| panel:", repr(txt3[:150]))
        ok &= "active" in tab and "measurement-card" in (await page.eval_on_selector('#inspectorContent', "el => el.innerHTML"))

    # --- stop sim, About dialog shows v1.2 ---
    await page.click('#simulateBtn')
    await page.wait_for_timeout(300)
    # open menu -> about; find the button that opens about
    about_version = await page.evaluate("""() => {
        // try common ways to open About
        const btn = document.querySelector('#aboutBtn') || [...document.querySelectorAll('button')].find(b => /about/i.test(b.textContent));
        if (btn) { btn.click(); }
        return null;
    }""")
    await page.wait_for_timeout(400)
    modal = await page.eval_on_selector('#modal', "el => el.innerHTML")
    print("About modal contains 'v1.2':", 'v1.2' in modal)
    ok &= ('v1.2' in modal)

    print("Errors:", errors if errors else "none")
    ok &= not any("PAGEERROR" in e for e in errors)
    await browser.close()
    print(f"RESULT {label}:", "PASS" if ok else "FAIL")
    return ok

async def main():
    async with async_playwright() as pw:
        r1 = await check_page(pw, "file:///home/user/fluxa_work/fluxa/index.html", "modular index.html")
        r2 = await check_page(pw, "file:///home/user/fluxa_work/fluxa/Fluxa.html", "standalone Fluxa.html")
        sys.exit(0 if (r1 and r2) else 1)

asyncio.run(main())

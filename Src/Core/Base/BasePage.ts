import { test, expect, Page, Locator, Frame, FrameLocator, Download, Dialog, Response } from '@playwright/test';
import type { AppName } from '../../../Config/ConfigManager';

/* -------------------------------------------------------------------------
   1. TYPES & CONSTANTS - shared by every page object
   ------------------------------------------------------------------------- */
// Options accepted by the action helpers
export interface ActionOptions {
    /** Friendly name shown in the report step - defaults to the locator description */
    name?: string;
    /** Per action timeout in ms - defaults to DEFAULT_TIMEOUT */
    timeout?: number;
    /** Bypass actionability checks - use only as a last resort */
    force?: boolean;
    /** Hide the value from the report step - use for passwords, tokens, etc. */
    sensitive?: boolean;
}

export type LoadState = 'load' | 'domcontentloaded' | 'networkidle';

export const DEFAULT_TIMEOUT = 30_000;
export const NAVIGATION_TIMEOUT = 60_000;

/* -------------------------------------------------------------------------
   2. BASE PAGE - parent of every page object in the framework.

      Responsibilities
        - owns the Playwright `page` and exposes it to child classes only
        - defines the contract each page object must fulfil (abstract members)
        - wraps Playwright calls so every action is a named report step
        - holds NO locators and NO business flows - those belong to the child

      Layering
        Test spec  ->  Page object (extends BasePage)  ->  BasePage  ->  Playwright
   ------------------------------------------------------------------------- */
export abstract class BasePage {

    /* ---------------------------------------------------------------------
       PROPERTIES
       --------------------------------------------------------------------- */
    protected readonly page: Page;

    /** Application this page belongs to - lets the page pick the right creds */
    protected abstract readonly appName: AppName;

    /** Human readable page name used in report steps and error messages */
    protected abstract readonly pageName: string;

    /** Path (or full url) of the page, resolved against baseURL by open() */
    protected abstract readonly pagePath: string;

    /** One element that proves the page is rendered - used by isLoaded() */
    protected abstract readonly pageReadyLocator: Locator;

    constructor(page: Page) {
        this.page = page;
    }

    /* ---------------------------------------------------------------------
       REPORTING - every helper below runs inside a named step
       --------------------------------------------------------------------- */
    /** Wraps any block in a report step, collapsed on success so reports stay readable */
    protected async step<T>(title: string, body: () => Promise<T>): Promise<T> {
        return test.step(`${this.pageName}: ${title}`, body, { box: true });
    }

    /** Name used in report steps - explicit name wins, else the locator description */
    private label(locator: Locator, options?: ActionOptions): string {
        return options?.name ?? locator.toString();
    }

    /** Attaches a full page screenshot to the report - safe to call from a failure hook */
    public async takeScreenshot(name: string = this.pageName, fullPage = true): Promise<void> {
        const body = await this.page.screenshot({ fullPage });
        await test.info().attach(name, { body, contentType: 'image/png' });
    }

    /* ---------------------------------------------------------------------
       NAVIGATION & PAGE STATE
       --------------------------------------------------------------------- */
    /** Opens this page and verifies it rendered */
    public async open(): Promise<void> {
        await this.step(`open ${this.pagePath}`, async () => {
            await this.page.goto(this.pagePath, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
            await this.waitForPageReady();
        });
    }

    /** Navigates to any url - for hops outside the page's own path */
    protected async navigateTo(url: string, waitUntil: LoadState = 'domcontentloaded'): Promise<void> {
        await this.step(`navigate to ${url}`, () =>
            this.page.goto(url, { waitUntil, timeout: NAVIGATION_TIMEOUT }).then(() => undefined));
    }

    public async reload(waitUntil: LoadState = 'domcontentloaded'): Promise<void> {
        await this.step('reload', () => this.page.reload({ waitUntil }).then(() => undefined));
    }

    public async goBack(): Promise<void> {
        await this.step('go back', () => this.page.goBack().then(() => undefined));
    }

    public async goForward(): Promise<void> {
        await this.step('go forward', () => this.page.goForward().then(() => undefined));
    }

    /** Waits until the page's marker element is visible - throws if it never is */
    public async waitForPageReady(timeout: number = DEFAULT_TIMEOUT): Promise<void> {
        await this.step('wait for page ready', () =>
            this.pageReadyLocator.waitFor({ state: 'visible', timeout }));
    }

    /** Non throwing check - true when the page's marker element is visible */
    public async isLoaded(): Promise<boolean> {
        return this.pageReadyLocator.isVisible();
    }

    protected async waitForLoadState(state: LoadState = 'load'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    public async getTitle(): Promise<string> {
        return this.page.title();
    }

    public getUrl(): string {
        return this.page.url();
    }

    protected async waitForUrl(url: string | RegExp, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
        await this.step(`wait for url ${url}`, () => this.page.waitForURL(url, { timeout }));
    }

    /* ---------------------------------------------------------------------
       ELEMENT ACTIONS
       --------------------------------------------------------------------- */
    protected async click(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`click ${this.label(locator, options)}`, () =>
            locator.click({ timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    protected async doubleClick(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`double click ${this.label(locator, options)}`, () =>
            locator.dblclick({ timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    protected async rightClick(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`right click ${this.label(locator, options)}`, () =>
            locator.click({ button: 'right', timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    /** Replaces the field content - the value is masked in the report when sensitive */
    protected async fill(locator: Locator, value: string, options: ActionOptions = {}): Promise<void> {
        const shown = options.sensitive ? '****' : value;
        await this.step(`fill ${this.label(locator, options)} with "${shown}"`, () =>
            locator.fill(value, { timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    /** Types key by key - for fields that react to key events (autocomplete, masks) */
    protected async typeSlowly(locator: Locator, value: string, options: ActionOptions & { delay?: number } = {}): Promise<void> {
        const shown = options.sensitive ? '****' : value;
        await this.step(`type ${this.label(locator, options)} "${shown}"`, async () => {
            await locator.click({ timeout: options.timeout ?? DEFAULT_TIMEOUT });
            await locator.pressSequentially(value, { delay: options.delay ?? 50 });
        });
    }

    protected async clear(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`clear ${this.label(locator, options)}`, () =>
            locator.clear({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async pressKey(locator: Locator, key: string, options: ActionOptions = {}): Promise<void> {
        await this.step(`press "${key}" on ${this.label(locator, options)}`, () =>
            locator.press(key, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async check(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`check ${this.label(locator, options)}`, () =>
            locator.check({ timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    protected async uncheck(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`uncheck ${this.label(locator, options)}`, () =>
            locator.uncheck({ timeout: options.timeout ?? DEFAULT_TIMEOUT, force: options.force }));
    }

    /** Native <select> - picks by value, label or index */
    protected async selectOption(
        locator: Locator,
        option: string | { value?: string; label?: string; index?: number },
        options: ActionOptions = {}
    ): Promise<void> {
        await this.step(`select ${JSON.stringify(option)} in ${this.label(locator, options)}`, () =>
            locator.selectOption(option, { timeout: options.timeout ?? DEFAULT_TIMEOUT }).then(() => undefined));
    }

    protected async hover(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`hover ${this.label(locator, options)}`, () =>
            locator.hover({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async focus(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`focus ${this.label(locator, options)}`, () =>
            locator.focus({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async scrollIntoView(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`scroll to ${this.label(locator, options)}`, () =>
            locator.scrollIntoViewIfNeeded({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async dragAndDrop(source: Locator, target: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`drag ${this.label(source)} to ${this.label(target)}`, () =>
            source.dragTo(target, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    /** Page level keyboard shortcut - e.g. 'Control+S', 'Escape' */
    protected async pressGlobalKey(key: string): Promise<void> {
        await this.step(`press "${key}"`, () => this.page.keyboard.press(key));
    }

    /* ---------------------------------------------------------------------
       ELEMENT READS
       --------------------------------------------------------------------- */
    protected async getText(locator: Locator, options: ActionOptions = {}): Promise<string> {
        return (await locator.innerText({ timeout: options.timeout ?? DEFAULT_TIMEOUT })).trim();
    }

    protected async getAllTexts(locator: Locator): Promise<string[]> {
        return (await locator.allInnerTexts()).map(text => text.trim());
    }

    protected async getInputValue(locator: Locator, options: ActionOptions = {}): Promise<string> {
        return locator.inputValue({ timeout: options.timeout ?? DEFAULT_TIMEOUT });
    }

    protected async getAttribute(locator: Locator, attribute: string, options: ActionOptions = {}): Promise<string | null> {
        return locator.getAttribute(attribute, { timeout: options.timeout ?? DEFAULT_TIMEOUT });
    }

    protected async count(locator: Locator): Promise<number> {
        return locator.count();
    }

    protected async isVisible(locator: Locator): Promise<boolean> {
        return locator.isVisible();
    }

    protected async isEnabled(locator: Locator): Promise<boolean> {
        return locator.isEnabled();
    }

    protected async isChecked(locator: Locator): Promise<boolean> {
        return locator.isChecked();
    }

    /* ---------------------------------------------------------------------
       WAITS - always condition based, never fixed sleeps
       --------------------------------------------------------------------- */
    protected async waitForVisible(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`wait for ${this.label(locator, options)} to be visible`, () =>
            locator.waitFor({ state: 'visible', timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    /** Resolves when the element is hidden or removed - typical for spinners and toasts */
    protected async waitForHidden(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`wait for ${this.label(locator, options)} to be hidden`, () =>
            locator.waitFor({ state: 'hidden', timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async waitForResponse(
        urlOrPredicate: string | RegExp | ((response: Response) => boolean),
        trigger: () => Promise<unknown>,
        timeout: number = DEFAULT_TIMEOUT
    ): Promise<Response> {
        return this.step('wait for response', async () => {
            const [response] = await Promise.all([
                this.page.waitForResponse(urlOrPredicate, { timeout }),
                trigger()
            ]);
            return response;
        });
    }

    /* ---------------------------------------------------------------------
       FRAMES, TABS, DIALOGS
       --------------------------------------------------------------------- */
    /** Scopes locators to an iframe - use `.locator(...)` or `.getByRole(...)` on the result */
    protected frameLocator(selector: string): FrameLocator {
        return this.page.frameLocator(selector);
    }

    protected frameByName(name: string): Frame | null {
        return this.page.frame({ name });
    }

    /** Runs the trigger and returns the new tab it opens - wrap it in the next page object */
    protected async switchToNewTab(trigger: () => Promise<unknown>): Promise<Page> {
        return this.step('switch to new tab', async () => {
            const [newPage] = await Promise.all([
                this.page.context().waitForEvent('page', { timeout: DEFAULT_TIMEOUT }),
                trigger()
            ]);
            await newPage.waitForLoadState('domcontentloaded');
            return newPage;
        });
    }

    /** Registers a one-off handler - call BEFORE the action that raises the dialog */
    protected handleNextDialog(action: 'accept' | 'dismiss', promptText?: string): void {
        this.page.once('dialog', (dialog: Dialog) =>
            action === 'accept' ? dialog.accept(promptText) : dialog.dismiss());
    }

    /* ---------------------------------------------------------------------
       FILES
       --------------------------------------------------------------------- */
    protected async uploadFiles(input: Locator, files: string | string[], options: ActionOptions = {}): Promise<void> {
        await this.step(`upload ${[files].flat().join(', ')} to ${this.label(input, options)}`, () =>
            input.setInputFiles(files, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    /** Clicks the trigger, saves the download under the test output folder and returns its path */
    protected async downloadFile(trigger: Locator, options: ActionOptions = {}): Promise<string> {
        return this.step(`download via ${this.label(trigger, options)}`, async () => {
            const [download]: [Download, void] = await Promise.all([
                this.page.waitForEvent('download', { timeout: options.timeout ?? DEFAULT_TIMEOUT }),
                trigger.click()
            ]);
            const savedTo = test.info().outputPath(download.suggestedFilename());
            await download.saveAs(savedTo);
            return savedTo;
        });
    }

    /* ---------------------------------------------------------------------
       VERIFICATIONS - web first assertions that auto retry until timeout
       --------------------------------------------------------------------- */
    protected async expectVisible(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} is visible`, () =>
            expect(locator).toBeVisible({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async expectHidden(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} is hidden`, () =>
            expect(locator).toBeHidden({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async expectEnabled(locator: Locator, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} is enabled`, () =>
            expect(locator).toBeEnabled({ timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async expectText(locator: Locator, expected: string | RegExp, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} has text ${expected}`, () =>
            expect(locator).toHaveText(expected, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async expectValue(locator: Locator, expected: string | RegExp, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} has value ${options.sensitive ? '****' : expected}`, () =>
            expect(locator).toHaveValue(expected, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    protected async expectCount(locator: Locator, expected: number, options: ActionOptions = {}): Promise<void> {
        await this.step(`verify ${this.label(locator, options)} count is ${expected}`, () =>
            expect(locator).toHaveCount(expected, { timeout: options.timeout ?? DEFAULT_TIMEOUT }));
    }

    public async expectUrl(expected: string | RegExp, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
        await this.step(`verify url ${expected}`, () => expect(this.page).toHaveURL(expected, { timeout }));
    }

    public async expectTitle(expected: string | RegExp, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
        await this.step(`verify title ${expected}`, () => expect(this.page).toHaveTitle(expected, { timeout }));
    }
}

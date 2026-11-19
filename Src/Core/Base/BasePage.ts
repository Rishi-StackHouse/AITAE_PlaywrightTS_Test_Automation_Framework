import { Page, Locator, Response, expect } from '@playwright/test';
import { Logger } from '../Logger/Logger';

export abstract class BasePage {
    protected readonly page: Page;
    protected readonly log: Logger;

    constructor(page: Page, logApp?: string) {
        this.page = page;
        const namespace = logApp ? `${logApp}/${this.constructor.name}` : this.constructor.name;
        this.log = new Logger(namespace);
    }

    protected async NavigateToURL(url: string): Promise<Response | null> {
        const Response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        //await this.page.waitForLoadState('load');
        if (!Response) {
            this.log.warn(`No HTTP response received for the URL: ${url}`);
            console.log(`No HTTP response received for the URL: ${url}`);
        } else if (Response.ok()) {
            this.log.info(`Valid Response (status: ${Response.status()}) received for the URL: ${url}`);
            console.log(`Valid Response (status: ${Response.status()}) received for the URL: ${url}`);
        } else {
            this.log.warn(`In-Valid Response (status: ${Response.status()}) received for the URL: ${url}`);
            console.log(`In-Valid Response (status: ${Response.status()}) received for the URL: ${url}`);
        }
        return Response;
    }
}


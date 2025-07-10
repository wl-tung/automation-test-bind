import { Page } from '@playwright/test';
import { TestLogger } from '../../utils/test-metrics';
import { WebLifeAuthPage } from '../pages/WebLifeAuthPage';
import { BiNDupSiteTheaterPage } from '../pages/BiNDupSiteTheaterPage';
import { BiNDupSiteEditorPage } from '../pages/BiNDupSiteEditorPage';

export interface UserCredentials {
  email: string;
  password: string;
}

export class SiteEditorWorkflow {
  private authPage: WebLifeAuthPage;
  private siteTheaterPage: BiNDupSiteTheaterPage;
  private siteEditorPage: BiNDupSiteEditorPage;
  private editorPageHandle: Page | null = null;

  constructor(private initialPage: Page) {
    this.authPage = new WebLifeAuthPage(initialPage);
  }

  async authenticateAndLaunchBiNDup(credentials: UserCredentials): Promise<Page> {
    TestLogger.logPhase('AUTHENTICATION', 'Starting WebLife authentication and BiNDup launch');
    
    await this.authPage.navigateToAuth();
    await this.authPage.login(credentials.email, credentials.password);
    
    this.editorPageHandle = await this.authPage.launchBiNDup();
    
    // Initialize page objects for the new page
    this.siteTheaterPage = new BiNDupSiteTheaterPage(this.editorPageHandle);
    this.siteEditorPage = new BiNDupSiteEditorPage(this.editorPageHandle);
    
    return this.editorPageHandle;
  }

  async navigateToSiteEditor(): Promise<void> {
    TestLogger.logPhase('NAVIGATION', 'Navigating to site editor');
    
    if (!this.siteTheaterPage) {
      throw new Error('Site theater page not initialized. Call authenticateAndLaunchBiNDup first.');
    }

    await this.siteTheaterPage.handleStartGuidePopup();
    await this.siteTheaterPage.navigateToSiteTheater();
    await this.siteTheaterPage.selectFirstSiteForEditing();
    await this.siteTheaterPage.openSiteEditor();
  }

  async prepareSiteEditor(): Promise<void> {
    TestLogger.logPhase('PREPARATION', 'Preparing site editor for block operations');
    
    if (!this.siteEditorPage) {
      throw new Error('Site editor page not initialized. Call authenticateAndLaunchBiNDup first.');
    }

    await this.siteEditorPage.verifySiteEditorLoaded();
    await this.siteEditorPage.handleSecondStartGuidePopup();
    await this.siteEditorPage.enterPageEditMode();
  }

  async executeBlockAdditionMethods(): Promise<void> {
    TestLogger.logPhase('BLOCK_OPERATIONS', 'Executing three block addition methods');
    
    if (!this.siteEditorPage) {
      throw new Error('Site editor page not initialized. Call authenticateAndLaunchBiNDup first.');
    }

    // Execute all three methods
    await this.siteEditorPage.addBlankBlock();
    await this.siteEditorPage.addSharedBlock();
    await this.siteEditorPage.addTemplateBlock();
    
    TestLogger.logPhase('BLOCK_OPERATIONS', 'All block addition methods completed successfully');
  }

  async executeFullWorkflow(credentials: UserCredentials): Promise<void> {
    TestLogger.logPhase('WORKFLOW_START', 'Starting complete site editor workflow');
    
    try {
      await this.authenticateAndLaunchBiNDup(credentials);
      await this.navigateToSiteEditor();
      await this.prepareSiteEditor();
      await this.executeBlockAdditionMethods();
      
      TestLogger.logPhase('WORKFLOW_COMPLETE', 'Site editor workflow completed successfully');
    } catch (error) {
      TestLogger.logPhase('WORKFLOW_ERROR', `Workflow failed: ${error}`);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    TestLogger.logPhase('CLEANUP', 'Cleaning up workflow resources');
    
    if (this.editorPageHandle && !this.editorPageHandle.isClosed()) {
      await this.editorPageHandle.close();
      this.editorPageHandle = null;
    }
  }

  getEditorPage(): Page | null {
    return this.editorPageHandle;
  }
}

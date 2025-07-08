import { test, expect } from '@fixtures/page-fixtures';
import { TestUsers } from '@data/test-data';
import { SiteTheaterHealthChecker, HealthCheckResult } from '@pages/site-theater-health-checker';

test.describe('Site Theater Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(240000); // 4 minutes timeout for comprehensive testing
  });

  test('STT-01: Complete WebLife Authentication and Site Theater Access', async ({ 
    webLifeAuthPage, 
    browserName 
  }) => {
    console.log(`🎭 STT-01: Complete WebLife Authentication and Site Theater Access on ${browserName.toUpperCase()}`);
    
    // Given: User navigates to WebLife authentication page
    console.log('📍 Given: User navigates to WebLife authentication page');
    await webLifeAuthPage.goto();
    await webLifeAuthPage.verifyAuthPageLoaded();
    await expect(webLifeAuthPage.page).toHaveURL(/mypage\.weblife\.me\/auth/);
    console.log('✅ WebLife auth page loaded successfully');

    // When: User enters valid credentials and logs in
    console.log('📍 When: User enters valid credentials and logs in');
    console.log('   - Entering email: [HIDDEN]');
    console.log('   - Entering password: [HIDDEN]');
    await webLifeAuthPage.login(
      TestUsers.webLifeUser.email,
      TestUsers.webLifeUser.password
    );
    console.log('✅ Login credentials submitted');

    // Then: User should be successfully authenticated
    console.log('📍 Then: User should be successfully authenticated');
    await webLifeAuthPage.waitForLoginSuccess();
    await expect(webLifeAuthPage.page).not.toHaveURL(/\/auth\//);
    console.log('✅ Authentication successful, redirected from auth page');

    // And: User should be able to access Site Theater via BiNDup
    console.log('📍 And: User should be able to access Site Theater via BiNDup');
    const result = await webLifeAuthPage.verifyBiNDupLoaded();
    const bindupPage = result.page;
    const healthResult = result.health;
    
    // Verify Site Theater is accessible
    const url = bindupPage.url();
    const isValidSiteTheaterUrl = url.includes('bindcloud.jp') || 
                                 url.includes('siteTheater') || 
                                 url.includes('bindstart');
    
    expect(isValidSiteTheaterUrl).toBe(true);
    console.log(`✅ Site Theater accessible at: ${url}`);
    console.log('🎉 STT-01: Test completed successfully');
  });

  test('STT-02: Site Theater Health Monitoring and Validation', async ({ 
    webLifeAuthPage, 
    browserName 
  }) => {
    console.log(`🏥 STT-02: Site Theater Health Monitoring and Validation on ${browserName.toUpperCase()}`);
    
    // Given: User is authenticated and Site Theater is loaded
    console.log('📍 Given: User is authenticated and Site Theater is loaded');
    await webLifeAuthPage.goto();
    await webLifeAuthPage.verifyAuthPageLoaded();
    await webLifeAuthPage.login(TestUsers.webLifeUser.email, TestUsers.webLifeUser.password);
    await webLifeAuthPage.waitForLoginSuccess();
    console.log('✅ User authenticated successfully');

    // When: Site Theater health check is performed
    console.log('📍 When: Site Theater health check is performed');
    const result = await webLifeAuthPage.verifyBiNDupLoaded();
    const bindupPage = result.page;
    const healthResult = result.health;
    console.log('✅ Health check completed');

    // Then: Site Theater should pass all critical health checks
    console.log('📍 Then: Site Theater should pass all critical health checks');
    console.log(`   - Overall Health Status: ${healthResult.overall}`);
    console.log(`   - Browser: ${healthResult.browser}`);
    console.log(`   - URL: ${healthResult.url}`);
    
    // Critical health assertions
    expect(healthResult.overall).not.toBe('FAIL');
    expect(healthResult.checks.basicPage.status).toBe('PASS');
    expect(healthResult.checks.coreFunctionality.status).not.toBe('FAIL');
    expect(healthResult.checks.errorDetection.status).not.toBe('FAIL');
    
    console.log('✅ All critical health checks passed');
    
    // And: Detailed health report should be generated
    console.log('📍 And: Detailed health report should be generated');
    const healthSummary = generateHealthSummary(healthResult);
    console.log(`   - Total Checks: ${healthSummary.summary.total}`);
    console.log(`   - Passed: ${healthSummary.summary.passed}`);
    console.log(`   - Warnings: ${healthSummary.summary.warnings}`);
    console.log(`   - Failed: ${healthSummary.summary.failed}`);
    console.log(`   - Build Recommendation: ${healthSummary.buildRecommendation}`);
    
    expect(healthSummary).toBeDefined();
    console.log('✅ Health report generated successfully');
    console.log('🎉 STT-02: Test completed successfully');
  });

  test('STT-03: Site Theater Build Validation for Production Deployment', async ({ 
    webLifeAuthPage, 
    browserName 
  }) => {
    console.log(`🏗️ STT-03: Site Theater Build Validation for Production Deployment on ${browserName.toUpperCase()}`);
    
    // Given: Production build validation is required
    console.log('📍 Given: Production build validation is required');
    console.log('   - Purpose: Validate Site Theater readiness for production');
    console.log('   - Environment: Production-like testing');
    
    // When: Complete authentication and Site Theater loading is performed
    console.log('📍 When: Complete authentication and Site Theater loading is performed');
    await webLifeAuthPage.goto();
    await webLifeAuthPage.verifyAuthPageLoaded();
    await webLifeAuthPage.login(TestUsers.webLifeUser.email, TestUsers.webLifeUser.password);
    await webLifeAuthPage.waitForLoginSuccess();
    console.log('✅ Authentication completed for build validation');

    // And: Site Theater is launched with retry logic for stability
    console.log('📍 And: Site Theater is launched with retry logic for stability');
    let attempts = 0;
    let maxAttempts = 3;
    let success = false;
    let lastResult = null;

    while (attempts < maxAttempts && !success) {
      attempts++;
      console.log(`   - Attempt ${attempts}/${maxAttempts}`);
      
      try {
        const result = await webLifeAuthPage.verifyBiNDupLoaded();
        const bindupPage = result.page;
        const healthResult = result.health;
        lastResult = { bindupPage, healthResult };

        const url = bindupPage.url();
        const isSiteTheaterUrl = url.includes('siteTheater') && url.includes('bindcloud.jp');

        if (isSiteTheaterUrl && healthResult.overall !== 'FAIL') {
          success = true;
          console.log('✅ Site Theater loaded successfully for build validation');
          
          // Then: Production validation checks should pass
          console.log('📍 Then: Production validation checks should pass');
          await validateSiteTheaterForProduction(bindupPage, healthResult, browserName);
        } else {
          console.log(`   ⚠️ Attempt ${attempts} failed - retrying...`);
          if (attempts < maxAttempts) {
            await bindupPage.close();
            await webLifeAuthPage.page.waitForTimeout(2000);
          }
        }
      } catch (error) {
        console.log(`   ❌ Attempt ${attempts} error: ${error instanceof Error ? error.message : String(error)}`);
        if (attempts < maxAttempts) {
          await webLifeAuthPage.page.waitForTimeout(2000);
        }
      }
    }

    // Final validation
    if (success) {
      console.log('✅ BUILD VALIDATION PASSED - Site Theater ready for production');
    } else {
      console.log('❌ BUILD VALIDATION FAILED - Site Theater NOT ready for production');
      if (lastResult) {
        console.log(`   - Final URL: ${lastResult.bindupPage.url()}`);
        console.log(`   - Final Health: ${lastResult.healthResult.overall}`);
      }
      throw new Error('Site Theater failed build validation');
    }
    console.log('🎉 STT-03: Test completed successfully');
  });

  test('STT-04: Cross-Browser Site Theater Compatibility', async ({ 
    webLifeAuthPage, 
    browserName 
  }) => {
    console.log(`🌐 STT-04: Cross-Browser Site Theater Compatibility on ${browserName.toUpperCase()}`);
    
    // Given: Cross-browser compatibility testing is required
    console.log('📍 Given: Cross-browser compatibility testing is required');
    console.log(`   - Target Browser: ${browserName}`);
    console.log('   - Purpose: Ensure Site Theater works across different browsers');
    
    // When: User completes the full Site Theater access flow
    console.log('📍 When: User completes the full Site Theater access flow');
    await webLifeAuthPage.goto();
    await webLifeAuthPage.verifyAuthPageLoaded();
    await webLifeAuthPage.login(TestUsers.webLifeUser.email, TestUsers.webLifeUser.password);
    await webLifeAuthPage.waitForLoginSuccess();
    
    const result = await webLifeAuthPage.verifyBiNDupLoaded();
    const bindupPage = result.page;
    const healthResult = result.health;
    console.log('✅ Site Theater access flow completed');

    // Then: Site Theater should be compatible with the current browser
    console.log('📍 Then: Site Theater should be compatible with the current browser');
    const browserValidation = {
      browser: browserName,
      userAgent: await bindupPage.evaluate(() => navigator.userAgent),
      viewport: bindupPage.viewportSize(),
      health: healthResult.overall,
      url: bindupPage.url(),
      timestamp: new Date().toISOString(),
    };
    
    console.log(`   - Browser: ${browserValidation.browser}`);
    console.log(`   - Health Status: ${browserValidation.health}`);
    console.log(`   - URL: ${browserValidation.url}`);
    
    // Browser compatibility assertions
    expect(browserValidation.health).not.toBe('FAIL');
    expect(browserValidation.url).toMatch(/bindcloud\.jp|siteTheater|bindstart/);
    
    console.log(`✅ ${browserName.toUpperCase()} compatibility confirmed`);
    console.log('🎉 STT-04: Test completed successfully');
  });

  test('STT-05: Site Theater Performance Monitoring', async ({ 
    webLifeAuthPage, 
    browserName 
  }) => {
    console.log(`📊 STT-05: Site Theater Performance Monitoring on ${browserName.toUpperCase()}`);
    
    // Given: Performance monitoring is required for Site Theater
    console.log('📍 Given: Performance monitoring is required for Site Theater');
    const startTime = Date.now();
    
    // When: User performs the complete Site Theater access flow with timing
    console.log('📍 When: User performs the complete Site Theater access flow with timing');
    
    await webLifeAuthPage.goto();
    const authTime = Date.now() - startTime;
    console.log(`   - Auth page load time: ${authTime}ms`);
    
    await webLifeAuthPage.login(TestUsers.webLifeUser.email, TestUsers.webLifeUser.password);
    const loginTime = Date.now() - startTime;
    console.log(`   - Login completion time: ${loginTime}ms`);
    
    await webLifeAuthPage.waitForLoginSuccess();
    const mypageTime = Date.now() - startTime;
    console.log(`   - MyPage load time: ${mypageTime}ms`);
    
    const result = await webLifeAuthPage.verifyBiNDupLoaded();
    const totalTime = Date.now() - startTime;
    console.log(`   - Total Site Theater access time: ${totalTime}ms`);

    // Then: Performance should meet acceptable thresholds
    console.log('📍 Then: Performance should meet acceptable thresholds');
    const performanceThresholds = {
      auth: 20000,      // 20 seconds
      login: 45000,     // 45 seconds  
      mypage: 60000,    // 1 minute
      total: browserName === 'webkit' ? 120000 : 90000, // 2 min for WebKit, 1.5 min for Chrome
    };
    
    console.log(`   - Auth threshold: ${performanceThresholds.auth}ms`);
    console.log(`   - Login threshold: ${performanceThresholds.login}ms`);
    console.log(`   - MyPage threshold: ${performanceThresholds.mypage}ms`);
    console.log(`   - Total threshold: ${performanceThresholds.total}ms`);
    
    // Performance assertions
    expect(authTime).toBeLessThan(performanceThresholds.auth);
    expect(loginTime).toBeLessThan(performanceThresholds.login);
    expect(mypageTime).toBeLessThan(performanceThresholds.mypage);
    expect(totalTime).toBeLessThan(performanceThresholds.total);
    
    console.log('✅ All performance thresholds met');
    console.log('🎉 STT-05: Test completed successfully');
  });
});

// Helper Functions
async function validateSiteTheaterForProduction(
  page: any,
  healthResult: HealthCheckResult,
  browserName: string
): Promise<void> {
  console.log('   🏭 Production Validation Checks:');
  
  // URL validation
  const url = page.url();
  expect(url).toContain('siteTheater');
  expect(url).toContain('bindcloud.jp');
  console.log('   ✅ URL structure valid for production');
  
  // Health status validation
  expect(healthResult.overall).not.toBe('FAIL');
  console.log('   ✅ Overall health acceptable for production');
  
  // Critical functionality validation
  expect(healthResult.checks.basicPage.status).toBe('PASS');
  expect(healthResult.checks.errorDetection.status).not.toBe('FAIL');
  console.log('   ✅ Critical functionality working for production');
  
  // Take production validation screenshot
  await page.screenshot({
    path: `test-results/production-validation-${browserName}-${Date.now()}.png`,
    fullPage: true,
  });
  console.log('   ✅ Production validation screenshot captured');
}

function generateHealthSummary(healthResult: HealthCheckResult): any {
  const checks = Object.values(healthResult.checks);
  return {
    overall: healthResult.overall,
    browser: healthResult.browser,
    timestamp: healthResult.timestamp,
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'PASS').length,
      warnings: checks.filter(c => c.status === 'WARN').length,
      failed: checks.filter(c => c.status === 'FAIL').length,
    },
    buildRecommendation:
      healthResult.overall === 'FAIL'
        ? 'REJECT_BUILD'
        : healthResult.overall === 'WARN'
          ? 'REVIEW_REQUIRED'
          : 'APPROVE_BUILD',
  };
}

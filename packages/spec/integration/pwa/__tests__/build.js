describe('pwa production build', () => {
  let url;

  beforeAll(async () => {
    jest.setTimeout(30000);
    await HopsCLI.build();
    url = await HopsCLI.serve();
  });

  it('registers a service worker', async () => {
    const { page } = await createPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // wait until service worker is installed
    await page.evaluate('navigator.serviceWorker.ready');

    // save all requests during the second visit
    const requests = new Map();
    page.on('request', req => {
      requests.set(req.url(), req);
    });

    await page.reload({ waitUntil: 'networkidle2' });

    // page should now be controlled by a service worker
    expect(
      await page.evaluate('navigator.serviceWorker.controller')
    ).not.toBeNull();

    // all responses should now come from the service worker
    expect(
      Array.from(requests.values()).map(r => r.response().fromServiceWorker())
    ).toEqual([true, true, true]);

    await page.close();
  });
});

import {TestProjectPage} from "./app.po";

describe('test-project App', () => {
  let page: TestProjectPage;

  beforeEach(() => {
    page = new TestProjectPage();
  });

  it('should display welcome message', async (done) => {
    page.navigateTo();
    expect(await page.getParagraphText()).toEqual('Welcome to app!!');
    done();
  });
});

import { pixivRegExp, PixivSearch } from "../../src";

describe("pixiv tests", () => {
  test("init", () => {
    expect.assertions(3);
    const search = new PixivSearch({});
    expect(search).not.toBeNull();
    expect(search).toBeDefined();
    expect(search instanceof PixivSearch).toBeTruthy();
  });

  test("login", async () => {
    expect.assertions(1);
    const search = new PixivSearch({});
    const authorized = await search.login();
    expect(authorized).toBeFalsy();
  }, 60000);

  describe("links", () => {
    test("valid links", () => {
      expect.assertions(2);
      expect(
        pixivRegExp.test("https://www.pixiv.net/en/users/10655554/artworks")
      ).toBeTruthy();
      expect(
        pixivRegExp.test("https://www.pixiv.net/en/users/10655554/")
      ).toBeTruthy();
    });

    test("invalid links", () => {
      expect.assertions(4);
      expect(pixivRegExp.test("https://google.com")).toBeFalsy();
      expect(
        pixivRegExp.test("https://www.pixiv.net/en/users_and_ponies")
      ).toBeFalsy();
      expect(pixivRegExp.test("https://twitter.com/genskc")).toBeFalsy();
      expect(pixivRegExp.test("https://www.deviantart.com/kvacm")).toBeFalsy();
    });
  });

  describe("unauthorized session", () => {
    const search = new PixivSearch({
      username: "username",
      password: "password"
    });

    test("login with invalid credentials", async () => {
      expect.assertions(1);
      const authorized = await search.login();
      expect(authorized).toBeFalsy();
    }, 60000);

    test("getting images with valid link", async () => {
      expect.assertions(1);
      try {
        await search.getImages(
          "https://www.pixiv.net/en/users/10655554/artworks"
        );
      } catch (e) {
        expect(e.message).toMatch(/Pixiv account credentials need!/);
      }
    }, 120000);

    test("getting images with invalid link", async () => {
      expect.assertions(1);
      try {
        await search.getImages(
          "https://www.pixiv.net/InvalidLink"
        );
      } catch (e) {
        expect(e.message).toMatch(/Invalid pixiv link/);
      }
    });
  });

  describe("authorized session", () => {
    const search = new PixivSearch({
      username: process.env.PIXIV_USERNAME,
      password: process.env.PIXIV_PASSWORD
    });

    test("login with valid credentials", async () => {
      expect.assertions(1);
      const authorized = await search.login();
      expect(authorized).toBeTruthy();
    }, 60000);

    test("getting images with valid link", async () => {
      expect.assertions(2);
      const images = await search.getImages(
        "https://www.pixiv.net/en/users/10655554/artworks"
      );
      expect(Array.isArray(images)).toBeTruthy();
      expect(images.length).toBeGreaterThan(0);
    }, 120000);

    test("getting images with invalid link", async () => {
      expect.assertions(1);
      try {
        await search.getImages(
          "https://www.pixiv.net/NeverGonnaGiveMeUp"
        );
      } catch (e) {
        expect(e.message).toMatch(/Invalid pixiv link/);
      }
    });
  });
});

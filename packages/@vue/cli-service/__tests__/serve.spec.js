jest.setTimeout(60000)

const path = require('path')
const fs = require('fs-extra')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

test('serve', async () => {
  const project = await create('e2e-serve', defaultPreset)

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
      expect(await helpers.getText('h1')).toMatch(msg)

      // test hot reload
      const file = await project.read(`src/App.vue`)
      project.write(`src/App.vue`, file.replace(msg, `Updated`))
      await nextUpdate() // wait for child stdout update signal
      await page.waitForFunction(selector => {
        const el = document.querySelector(selector)
        return el && el.textContent.includes('Updated')
      }, {}, 'h1')
    }
  )
})

test('serve with router', async () => {
  const project = await create('e2e-serve-router', Object.assign({}, defaultPreset, {
    plugins: {
      '@vue/cli-plugin-router': {}
    }
  }))

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, helpers }) => {
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="#/"]', 'router-link-exact-active')).toBe(true)
      expect(await helpers.hasClass('a[href="#/about"]', 'router-link-exact-active')).toBe(false)

      await page.click('a[href="#/about"]')
      expect(await helpers.getText('h1')).toMatch(`This is an about page`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="#/"]', 'router-link-exact-active')).toBe(false)
      expect(await helpers.hasClass('a[href="#/about"]', 'router-link-exact-active')).toBe(true)
    }
  )
})

test('serve with legacy router option', async () => {
  const project = await create('e2e-serve-legacy-router', Object.assign({}, defaultPreset, {
    router: true,
    routerHistoryMode: true
  }))

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, helpers }) => {
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="/"]', 'router-link-exact-active')).toBe(true)
      expect(await helpers.hasClass('a[href="/about"]', 'router-link-exact-active')).toBe(false)

      await page.click('a[href="/about"]')
      expect(await helpers.getText('h1')).toMatch(`This is an about page`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="/"]', 'router-link-exact-active')).toBe(false)
      expect(await helpers.hasClass('a[href="/about"]', 'router-link-exact-active')).toBe(true)
    }
  )
})

test('serve with legacy vuex option', async () => {
  const project = await create('e2e-serve-legacy-vuex', Object.assign({}, defaultPreset, {
    vuex: true
  }))

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, helpers }) => {
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)
    }
  )
})

test('serve with inline entry', async () => {
  const project = await create('e2e-serve-inline-entry', defaultPreset)

  await fs.move(
    path.resolve(project.dir, 'src/main.js'),
    path.resolve(project.dir, 'src/index.js')
  )

  await serve(
    () => project.run('vue-cli-service serve src/index.js'),
    async ({ page, nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
      expect(await helpers.getText('h1')).toMatch(msg)

      // test hot reload
      const file = await project.read(`src/App.vue`)
      project.write(`src/App.vue`, file.replace(msg, `Updated`))
      await nextUpdate() // wait for child stdout update signal
      await page.waitForFunction(selector => {
        const el = document.querySelector(selector)
        return el && el.textContent.includes('Updated')
      }, {}, 'h1')
    }
  )
})

test('serve with no public dir', async () => {
  const project = await create('e2e-serve-no-public', defaultPreset)

  await fs.remove(path.resolve(project.dir, 'public'))

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
      expect(await helpers.getText('h1')).toMatch(msg)

      // test hot reload
      const file = await project.read(`src/App.vue`)
      project.write(`src/App.vue`, file.replace(msg, `Updated`))
      await nextUpdate() // wait for child stdout update signal
      await page.waitForFunction(selector => {
        const el = document.querySelector(selector)
        return el && el.textContent.includes('Updated')
      }, {}, 'h1')
    }
  )
})

test('dart sass', async () => {
  const project = await create('test-dart-sass', exports.defaultPreset = {
    useConfigFiles: false,
    cssPreprocessor: 'dart-sass',
    plugins: {}
  })

  // should build successfully
  await project.run('vue-cli-service build')
})

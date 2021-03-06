const path = require('path');
const {readFile, copy, outputFile, remove} = require('fs-extra');
const test = require('ava');
const {spy, match} = require('sinon');
const tempy = require('tempy');
const {waitFor, compile} = require('./helpers/utils');
const {mockPreprocessor} = require('./helpers/mock');

/* eslint prefer-named-capture-group: "off" */

test('Compile scss file', async t => {
	const fixture = 'test/fixtures/basic.scss';
	const {preprocessor, debug} = await mockPreprocessor();
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile sass file', async t => {
	const fixture = 'test/fixtures/basic.sass';
	const {preprocessor, debug} = await mockPreprocessor();
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with sourcemap (options.sourceMap)', async t => {
	const fixture = 'test/fixtures/basic.scss';
	const options = {sourceMap: true};
	const {preprocessor, debug} = await mockPreprocessor({}, {sassPreprocessor: {options}});
	const file = {originalPath: fixture};
	const {css, map} = await compile(fixture, options);

	t.is((await preprocessor(await readFile(fixture), file)).toString(), css);
	t.deepEqual(file.sourceMap, map);
	t.is(file.sourceMap.file, path.basename(fixture));
	t.truthy(file.sourceMap.mappings);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with sourcemap (options.map)', async t => {
	const fixture = 'test/fixtures/basic.scss';
	const options = {map: true};
	const {preprocessor, debug} = await mockPreprocessor({}, {sassPreprocessor: {options}});
	const file = {originalPath: fixture};
	const {css, map} = await compile(fixture, options);

	t.is((await preprocessor(await readFile(fixture), file)).toString(), css);
	t.deepEqual(file.sourceMap, map);
	t.is(file.sourceMap.file, path.basename(fixture));
	t.truthy(file.sourceMap.mappings);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with sourcemap (options.sourceMap) and custom preprocessor', async t => {
	const fixture = 'test/fixtures/basic.custom.scss';
	const options = {sourceMap: true};
	const {preprocessor, debug} = await mockPreprocessor({options});
	const file = {originalPath: fixture};
	const {css, map} = await compile(fixture, options);

	t.is((await preprocessor(await readFile(fixture), file)).toString(), css);
	t.deepEqual(file.sourceMap, map);
	t.is(file.sourceMap.file, path.basename(fixture));
	t.truthy(file.sourceMap.mappings);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.custom.css'));
});

test('Compile scss file with sourcemap (options.map) and custom preprocessor', async t => {
	const fixture = 'test/fixtures/basic.custom.scss';
	const options = {map: true};
	const {preprocessor, debug} = await mockPreprocessor({options});
	const file = {originalPath: fixture};
	const {css, map} = await compile(fixture, options);

	t.is((await preprocessor(await readFile(fixture), file)).toString(), css);
	t.deepEqual(file.sourceMap, map);
	t.is(file.sourceMap.file, path.basename(fixture));
	t.truthy(file.sourceMap.mappings);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.custom.css'));
});

test('Compile scss file with partial import', async t => {
	const fixture = 'test/fixtures/with-partial.scss';
	const options = {includePaths: ['test/fixtures/partials']};
	const {preprocessor, debug} = await mockPreprocessor({}, {sassPreprocessor: {options}});
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture, options)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/with-partial.css'));
});

test('Compile scss file with options', async t => {
	const fixture = 'test/fixtures/basic.scss';
	const options = {precision: 8, sourceComments: true, outputStyle: 'compressed'};
	const {preprocessor, debug} = await mockPreprocessor({}, {sassPreprocessor: {options}});
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture, options)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with non css extension', async t => {
	const fixture = 'test/fixtures/basic.txt';
	const {preprocessor, debug} = await mockPreprocessor();
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with no extension', async t => {
	const fixture = 'test/fixtures/basic';
	const {preprocessor, debug} = await mockPreprocessor();
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with custom transformPath', async t => {
	const fixture = 'test/fixtures/basic.txt';
	const transformPath = spy(filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''));
	const {preprocessor, debug} = await mockPreprocessor({}, {sassPreprocessor: {transformPath}});
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.true(transformPath.calledOnce);
	t.is(path.resolve(file.path), path.resolve('test/basic.css'));
});

test('Compile scss file with custom transformPath and custom preprocessor', async t => {
	const fixture = 'test/fixtures/basic.custom.txt';
	const transformPath = spy(filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''));
	const {preprocessor, debug} = await mockPreprocessor({transformPath});
	const file = {originalPath: fixture};

	t.is((await preprocessor(await readFile(fixture), file)).toString(), (await compile(fixture)).css);
	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.true(transformPath.calledOnce);
	t.is(path.resolve(file.path), path.resolve('test/basic.custom.css'));
});

test('Log error on invalid scss file', async t => {
	const fixture = 'test/fixtures/error.scss';
	const {preprocessor, debug, error} = await mockPreprocessor();
	const file = {originalPath: fixture};
	const err = await t.throwsAsync(preprocessor(await readFile(fixture), file), {instanceOf: Error});

	t.true(debug.firstCall.calledWith(match('Processing'), fixture));
	t.true(err.message.includes('no mixin named text-red'));
	t.is(err.line, 10);
	t.is(path.resolve(err.file), path.resolve(fixture));
	t.true(error.firstCall.calledWith(match.string, match('no mixin named text-red'), fixture, match(10)));
});

test('Instanciate watcher only if autoWatch is true', async t => {
	let {FSWatcher} = await mockPreprocessor();

	t.true(FSWatcher.notCalled);
	({FSWatcher} = await mockPreprocessor({}, {autoWatch: true}));

	t.true(FSWatcher.calledOnce);
});

test('Add dependency to watcher', async t => {
	const fixture = 'test/fixtures/with-partial.scss';
	const partial = path.resolve('test/fixtures/partials/_partial.scss');
	const subPartial = path.resolve('test/fixtures/partials/_sub-partial.scss');
	const options = {includePaths: ['test/fixtures/partials']};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{files: [{pattern: fixture, watched: true}], autoWatch: true, sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await preprocessor(await readFile(fixture), file);
	t.true(debug.secondCall.calledWith(match('Watching'), subPartial));
	t.true(debug.thirdCall.calledWith(match('Watching'), partial));
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([subPartial, partial])));
	t.true(watcher.add.calledOnce);
});

test('Add dependency to watcher for file added with glob', async t => {
	const fixture = 'test/fixtures/with-partial.scss';
	const glob = 'test/*/+(with|nomatch)*+(partial|nomatch).scss';
	const partial = path.resolve('test/fixtures/partials/_partial.scss');
	const subPartial = path.resolve('test/fixtures/partials/_sub-partial.scss');
	const options = {includePaths: ['test/fixtures/partials']};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{files: [{pattern: glob, watched: true}], autoWatch: true, sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await preprocessor(await readFile(fixture), file);
	t.true(debug.secondCall.calledWith(match('Watching'), subPartial));
	t.true(debug.thirdCall.calledWith(match('Watching'), partial));
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([subPartial, partial])));
	t.true(watcher.add.calledOnce);
});

test('Do not add dependency to watcher if parent is not watched', async t => {
	const fixture = 'test/fixtures/with-partial.scss';
	const options = {includePaths: ['test/fixtures/partials']};
	const {preprocessor, watcher} = await mockPreprocessor(
		{},
		{autoWatch: true, files: [{pattern: fixture, watched: false}], sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await preprocessor(await readFile(fixture), file);
	t.true(watcher.add.notCalled);
});

test('Add dependency to watcher only once, even when its referenced multiple times', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const otherFixture = path.join(dir, 'other-with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const partialAlt = path.join(includePath, '_partial-alt.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{
			autoWatch: true,
			files: [
				{pattern: fixture, watched: true},
				{pattern: otherFixture, watched: true},
			],
			sassPreprocessor: {options},
		}
	);
	const file = {originalPath: fixture};
	const otherFile = {originalPath: otherFixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_partial.scss', partialAlt),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
		copy('test/fixtures/with-partial.scss', otherFixture),
	]);
	await preprocessor(await readFile(fixture), file);
	t.true(debug.secondCall.calledWith(match('Watching'), partial));
	t.true(debug.thirdCall.calledWith(match('Watching'), subPartial));
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partial, subPartial])));
	debug.resetHistory();
	await preprocessor(await readFile(otherFixture), otherFile);
	t.true(watcher.add.calledOnce);
	t.true(debug.calledOnce);
});

test('Add dependency to watcher only once if file is overwritten', async t => {
	const fixture = 'test/fixtures/with-partial.scss';
	const partial = path.resolve('test/fixtures/partials/_partial.scss');
	const subPartial = path.resolve('test/fixtures/partials/_sub-partial.scss');
	const options = {includePaths: ['test/fixtures/partials']};
	const {preprocessor, watcher, debug, refreshFiles} = await mockPreprocessor(
		{},
		{files: [{pattern: fixture, watched: true}], autoWatch: true, sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await preprocessor(await readFile(fixture), file);
	t.true(debug.secondCall.calledWith(match('Watching'), subPartial));
	t.true(debug.thirdCall.calledWith(match('Watching'), partial));
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([subPartial, partial])));
	t.true(watcher.add.calledOnce);
	debug.resetHistory();
	watcher.emit('add', subPartial);
	await preprocessor(await readFile(fixture), file);
	t.true(refreshFiles.notCalled);
});

test('Remove dependency from watcher if not referenced anymore', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const partialAlt = path.join(includePath, '_partial-alt.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{autoWatch: true, files: [{pattern: fixture, watched: true}], sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_partial.scss', partialAlt),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
	]);
	await preprocessor(await readFile(fixture), file);
	watcher.add.resetHistory();
	debug.resetHistory();
	await outputFile(
		fixture,
		(await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
	);
	await preprocessor(await readFile(fixture), file);
	t.true(watcher.unwatch.firstCall.calledWith(match.array.deepEquals([partial])));
	t.true(debug.thirdCall.calledWith(match('Stop watching'), partial));
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partialAlt])));
	t.true(debug.secondCall.calledWith(match('Watching'), partialAlt));
	t.true(watcher.unwatch.calledOnce);
	t.true(watcher.add.calledOnce);
});

test('Do not remove dependency from watcher when unreferenced, if another file still depends on it', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const otherFixture = path.join(dir, 'other-with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const partialAlt = path.join(includePath, '_partial-alt.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{
			autoWatch: true,
			files: [
				{pattern: fixture, watched: true},
				{pattern: otherFixture, watched: true},
			],
			sassPreprocessor: {options},
		}
	);
	const file = {originalPath: fixture};
	const otherFile = {originalPath: otherFixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_partial.scss', partialAlt),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
		copy('test/fixtures/with-partial.scss', otherFixture),
	]);
	await preprocessor(await readFile(fixture), file);
	await preprocessor(await readFile(otherFixture), otherFile);
	watcher.add.resetHistory();
	debug.resetHistory();
	await outputFile(
		fixture,
		(await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
	);
	await preprocessor(await readFile(fixture), file);
	t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([path.resolve(partialAlt)])));
	t.true(watcher.unwatch.notCalled);
	t.true(debug.calledTwice);
});

test('Do not remove dependency from watcher when different files have differents childs', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const otherFixture = path.join(dir, 'other-with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const partialAlt = path.join(includePath, '_partial-alt.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, debug} = await mockPreprocessor(
		{},
		{
			autoWatch: true,
			files: [
				{pattern: fixture, watched: true},
				{pattern: otherFixture, watched: true},
			],
			sassPreprocessor: {options},
		}
	);
	const file = {originalPath: fixture};
	const otherFile = {originalPath: otherFixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_partial.scss', partialAlt),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
		copy('test/fixtures/with-partial.scss', otherFixture),
	]);
	await outputFile(
		fixture,
		(await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
	);
	await preprocessor(await readFile(fixture), file);
	watcher.add.resetHistory();
	debug.resetHistory();

	await preprocessor(await readFile(otherFixture), otherFile);
	t.true(watcher.add.calledOnce);
	t.true(watcher.unwatch.notCalled);
	t.true(debug.calledTwice);
});

test('Call refreshFiles when dependency is modified', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, info, refreshFiles} = await mockPreprocessor(
		{},
		{autoWatch: true, files: [{pattern: fixture, watched: true}], sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
	]);
	await preprocessor(await readFile(fixture), file);
	const change = waitFor(watcher, 'change');

	watcher.emit('change', partial);
	t.is(path.resolve(partial), await change);
	t.true(info.firstCall.calledWith(match('Changed file'), path.resolve(partial)));
	t.true(info.calledOnce);
	t.true(refreshFiles.calledOnce);
});

test('Call refreshFiles when dependency is deleted and added', async t => {
	const dir = tempy.directory();
	const fixture = path.join(dir, 'with-partial.scss');
	const includePath = path.join(dir, 'partials');
	const partial = path.join(includePath, '_partial.scss');
	const subPartial = path.join(includePath, '_sub-partial.scss');
	const options = {includePaths: [includePath]};
	const {preprocessor, watcher, info, refreshFiles} = await mockPreprocessor(
		{},
		{autoWatch: true, files: [{pattern: fixture, watched: true}], sassPreprocessor: {options}}
	);
	const file = {originalPath: fixture};

	await Promise.all([
		copy('test/fixtures/partials/_partial.scss', partial),
		copy('test/fixtures/partials/_sub-partial.scss', subPartial),
		copy('test/fixtures/with-partial.scss', fixture),
	]);
	await preprocessor(await readFile(fixture), file);
	const del = waitFor(watcher, 'unlink');

	watcher.emit('unlink', partial);
	remove(partial);
	t.is(path.resolve(partial), await del);
	t.true(info.firstCall.calledWith(match('Deleted file'), path.resolve(partial)));
	t.true(info.calledOnce);
	t.true(refreshFiles.calledOnce);
	info.resetHistory();
	refreshFiles.resetHistory();
	await t.throwsAsync(preprocessor(await readFile(fixture), file), {instanceOf: Error});
	const cpy = waitFor(watcher, 'add');

	await copy('test/fixtures/partials/_partial.scss', partial);
	watcher.emit('add', partial);
	t.is(path.resolve(partial), await cpy);
	t.true(info.firstCall.calledWith(match('Added file'), path.resolve(partial)));
	t.true(info.calledOnce);
	t.true(refreshFiles.calledOnce);
	await preprocessor(await readFile(fixture), file);
});

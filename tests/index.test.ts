import { test, expect, jest } from '@jest/globals';
import * as main from '../src/index';

const runMock = jest.spyOn(main, 'run').mockImplementation(async () => undefined);

test('run is exported and callable', async () => {
  await main.run();
  expect(runMock).toHaveBeenCalled();
});

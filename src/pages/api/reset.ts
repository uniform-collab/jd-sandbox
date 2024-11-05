import { exec } from 'child_process';
import { NextApiHandler } from 'next';

const execPromise = (command: string) =>
  new Promise(function (resolve, reject) {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout.trim());
    });
  });

const handler: NextApiHandler = async (_req, res) => {
  try {
    //This mean that we are running not Vercel
    if (!process.env.VERCEL_URL) {
      await execPromise('npm run uniform:push && npm run uniform:publish');
      return res.status(200).json({ message: 'Cache reset completed' });
    }
    if (!process.env.RESET_CANVAS_CONFIGURATION_HOOK_URL) {
      return res.status(400).json({ message: 'Reset canvas configuration hook url is not set' });
    }
    const result = await fetch(`${process.env.RESET_CANVAS_CONFIGURATION_HOOK_URL}?buildCache=false`);
    if (!result.ok) {
      const json = await result.json();
      return res.status(result.status).json(json);
    }
    return res.status(200).json({ message: 'Cache reset completed' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default handler;

import mongoose from 'mongoose';
import Express from 'express';

mongoose.connect('mongodb://localhost:27096', {
  authSource: '$external',
  authMechanism: 'MONGODB-OIDC',
  authMechanismProperties: {
    ENVIRONMENT: 'test',
  },
});

type Foo = {
  state: 'on' | 'off';
};

const fooSchema = new mongoose.Schema<Foo>(
  {
    state: {
      type: String,
      enum: ['on', 'off'],
    },
  },
  { timestamps: true }
);

const fooModel = mongoose.model('foo', fooSchema);

async function setupExpressTest() {
  const app = Express();

  app.get('*', async (_req, res) => {
    const foo = await fooModel.create({ state: 'on' });

    res.json(foo.toObject());
  });

  app.listen(8080, () => {
    console.log('listening on http://localhost:8080');
  });
}

setupExpressTest();

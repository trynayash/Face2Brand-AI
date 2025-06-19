import express from 'express';
import bodyParser from 'body-parser';
import visionProxy from './visionProxy';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/api', visionProxy);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
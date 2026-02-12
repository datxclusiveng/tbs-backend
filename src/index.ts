import 'reflect-metadata'
import express from 'express';
import { MulterError } from 'multer';
import { AppDataSource } from './data-source';
// import { User } from './entities/user.entities';
import authRoutes from './routes/auth.routes';
import photoRoutes from './routes/photo.routes';
import projectRoutes from './routes/project.routes';
import './utils/cron';
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));


app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/projects', projectRoutes);

AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized!");

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});

// Error-handling middleware: catch body-parser/raw-body and multer errors
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    void next;

    // Multer file upload errors
    if (err instanceof MulterError) {
        return res.status(400).json({ error: 'File upload error', message: err.message });
    }

    // Payload too large from raw-body/body-parser
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
        return res.status(413).json({ error: 'Payload Too Large', message: 'Request entity too large' });
    }

    // Fallback
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : 'Internal Server Error';
    return res.status(status).json({ error: message });
});
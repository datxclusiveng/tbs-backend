import 'reflect-metadata'
import express from 'express';
import { AppDataSource } from './data-source';
import { User } from './entities/user.entities';
import authRoutes from './routes/auth.routes';
import photoRoutes from './routes/photo.routes';
import projectRoutes from './routes/project.routes';

const app = express();
app.use(express.json());

// routes for server
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/projects', projectRoutes);


AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized!");



    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});
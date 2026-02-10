import 'reflect-metadata'
import express from 'express';
import { AppDataSource } from './data-source';
import { User } from './entities/user.entities';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(express.json());

// routes for server
app.use('/api/auth', authRoutes);


AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized!");



    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});
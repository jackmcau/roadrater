import express from 'express';

const router = express.Router();

// GET /roads - placeholder list
router.get('/', (req, res) => {
  const placeholderRoads = [
    { id: 1, name: 'Main Street', rating: 4.5 },
    { id: 2, name: 'Highway 101', rating: 3.8 },
    { id: 3, name: 'Oak Avenue', rating: 4.2 }
  ];
  
  res.json(placeholderRoads);
});

export default router;

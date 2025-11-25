import {
  createPropertyService,
  getAllPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
  deletePropertyService
} from "../services/propertyService.js";

export const createProperty = async (req, res) => {
  try {
    const data = req.body;
    const property = await createPropertyService(data);
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const properties = await getAllPropertiesService();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await getPropertyByIdService(parseInt(req.params.id));
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const updated = await updatePropertyService(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const deleted = await deletePropertyService(parseInt(req.params.id));
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

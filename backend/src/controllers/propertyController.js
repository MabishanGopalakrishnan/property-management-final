import {
  createPropertyService,
  getAllPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
  deletePropertyService,
} from "../services/propertyService.js";

// ✔ ROUTES EXPECT THIS NAME
export const listProperties = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const properties = await getAllPropertiesService(landlordId);
    return res.json(properties);
  } catch (err) {
    console.error("List properties error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};

// ✔ ROUTES EXPECT THIS NAME
export const getPropertyById = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.propertyId, 10);

    const property = await getPropertyByIdService(landlordId, id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    return res.json(property);
  } catch (err) {
    console.error("Get property by id error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};

// ✔ ROUTES EXPECT THIS NAME
export const createProperty = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "LANDLORD") {
      return res.status(403).json({ error: "Not authorized." });
    }

    const { title, address, city, province, postalCode, description } = req.body;

    const data = {
      title,
      address,
      city,
      province,
      postalCode,
      description: description || "",
      landlordId: req.user.id,
    };

    const property = await createPropertyService(data);
    return res.status(201).json(property);
  } catch (err) {
    console.error("Create property error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong.", details: err.message });
  }
};

// ✔ ROUTES EXPECT THIS NAME
export const updateProperty = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.propertyId, 10);

    const updated = await updatePropertyService(landlordId, id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error("Update property error:", err);
    return res.status(400).json({ error: err.message || "Something went wrong." });
  }
};

// ✔ ROUTES EXPECT THIS NAME
export const deleteProperty = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.propertyId, 10);

    const deleted = await deletePropertyService(landlordId, id);
    return res.json(deleted);
  } catch (err) {
    console.error("Delete property error:", err);
    return res.status(400).json({ error: err.message || "Something went wrong." });
  }
};

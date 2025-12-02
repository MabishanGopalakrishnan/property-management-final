SELECT u.id, u."unitNumber", u."propertyId", l.id as lease_id, l.status as lease_status
FROM "Unit" u 
LEFT JOIN "Lease" l ON u.id = l."unitId" AND l.status = 'ACTIVE'
WHERE u."propertyId" IN (3, 4, 555)
ORDER BY u.id;

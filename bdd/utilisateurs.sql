CREATE USER IF NOT EXISTS 'station'@'localhost' IDENTIFIED BY 'PrivateStation';
GRANT INSERT ON station_meteo.donnees_capteurs TO 'station'@'localhost';

CREATE USER IF NOT EXISTS 'client'@'localhost' IDENTIFIED BY 'PrivateClient';
GRANT SELECT ON station_meteo.* TO 'client'@'localhost';

FLUSH PRIVILEGES;

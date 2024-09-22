USE music_shop_db;

INSERT INTO inventory (name, image, description, quantity, price)
VALUES
  ("Stratocaster", "/images/strat.jpg", "One of the most iconic electric guitars ever made.", 3, 599.99),
  ("Mini Amp", "/images/amp.jpg", "A small practice amp that shouldn't annoy roommates or neighbors.", 10, 49.99),
  ("Bass Guitar", "/images/bass.jpg", "A four string electric bass guitar.", 10, 399.99),
  ("Acoustic Guitar", "/images/acoustic.jpg", "Perfect for campfire sing-alongs.", 4, 799.99),
  ("Ukulele", "/images/ukulele.jpg", "A four string tenor ukulele tuned GCEA.", 15, 99.99),
  ("Strap", "/images/strap.jpg", "Woven instrument strap keeps your guitar or bass strapped to you to allow playing while standing.", 20, 29.99),
  ("Assortment of Picks", "/images/picks.jpg", "Picks for acoustic or electric players.", 50, 9.99),
  ("Guitar Strings", "/images/strings.jpg", "High quality wound strings for your acoustic or electric guitar or bass.", 20, 12.99),
  ("Instrument Cable", "/images/cable.jpg", "A cable to connect an electric guitar or bass to an amplifier.", 15, 19.99);

INSERT INTO cart (inventory_id, quantity)
VALUES
  (1, 1),
  (6, 1),
  (7, 1),
  (9, 1),
  (2, 1);

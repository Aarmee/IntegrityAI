UPDATE users 
SET password_hash = '$2b$10$IDwo7vyOfKBhRlVyUNW3jOTeZg6pIaLVIlNR0o2ayCBS2RGKyeNo2' 
WHERE email LIKE '%@integrityai.edu' OR email LIKE '%@student.edu';

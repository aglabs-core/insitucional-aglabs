-- Desfaz a padronização de categorias, post a post.
--
-- Precisa ser por id: a fusão de 'automacao' em 'Automação' não tem volta
-- pelo nome da categoria, senão os posts que já eram 'Automação' voltariam
-- junto para o slug.

UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = 'f630df3e-62b2-4f1c-8a79-4fdc46add4d1';
UPDATE blog_posts SET category = 'Estratégia' WHERE id = '2e9f1ebb-a290-48e0-94f4-78c93ac0bbf0';
UPDATE blog_posts SET category = 'Automação' WHERE id = 'ba958836-9867-44f7-9a7e-421191b33856';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '5a6560b1-2309-4ad9-8d19-a58af1ee7cb0';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '79e5637d-81ed-4bfc-a443-939283b92526';
UPDATE blog_posts SET category = 'Estratégia' WHERE id = '305788b2-9858-4af0-ae92-258af704473b';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '545cb9df-c0dd-4dc6-b681-ae985a94992f';
UPDATE blog_posts SET category = 'Automação' WHERE id = '90fa25c7-601b-47d4-b684-130193795242';
UPDATE blog_posts SET category = 'Estratégia' WHERE id = 'b320938e-ed4a-4197-baf0-fdb194f31a28';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '395d7707-cc28-4e82-895e-b650af0bfdfb';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '8de82f2d-64c4-4d4a-be92-0ef73a72f29f';
UPDATE blog_posts SET category = 'Automação' WHERE id = 'c930d451-e783-43ce-a09f-4080041ef181';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = '4b3bdb3f-5d95-4cda-a1e9-9b6a0463bf60';
UPDATE blog_posts SET category = 'Automação' WHERE id = 'd9f9608b-59b3-4318-9bff-e04901d87a5f';
UPDATE blog_posts SET category = 'Estratégia' WHERE id = '355fe41a-5afb-4c03-a97d-53e5c218a00a';
UPDATE blog_posts SET category = 'Marketing' WHERE id = '6b336841-c831-4ddd-bc1e-e507b72af0c4';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE id = 'e00dcd11-80f9-4c6e-9287-5fec6d15dd67';
UPDATE blog_posts SET category = 'Automação' WHERE id = '172c3fe8-30d2-40bb-a4be-12134bb4594f';
UPDATE blog_posts SET category = 'Automação' WHERE id = 'e4919b61-8588-4510-b485-ca1d970aa558';
UPDATE blog_posts SET category = 'Estratégia' WHERE id = '7bdbce70-0ae0-46ea-bba8-5e23cacf7953';
UPDATE blog_posts SET category = 'Automação' WHERE id = 'eca985ea-67f5-4d45-a753-33178d64d234';
UPDATE blog_posts SET category = 'automacao' WHERE id = '88d6543f-b337-4e9c-b461-80a3a6b2cabb';
UPDATE blog_posts SET category = 'ia-conversacional' WHERE id = '88806a29-4137-4d5c-98f0-f31afd01350b';
UPDATE blog_posts SET category = 'sites' WHERE id = '9f483e92-4e03-4955-8bf8-fd142e7b9e18';
UPDATE blog_posts SET category = 'desenvolvimento' WHERE id = '65f9b15c-bf6a-4685-8632-46849989df6f';
UPDATE blog_posts SET category = 'automacao' WHERE id = 'c7bf84d1-9e9e-41fa-ae55-a6df14cde0fa';
UPDATE blog_posts SET category = 'sites' WHERE id = '44ac1688-0d05-4273-82b3-9d8892e6baa7';
UPDATE blog_posts SET category = 'ia-conversacional' WHERE id = '0b76caeb-9599-474a-9a7d-9d3f6e8e0138';
UPDATE blog_posts SET category = 'desenvolvimento' WHERE id = 'ead55914-41e2-4e68-82e6-1b60c9a83ce5';
UPDATE blog_posts SET category = 'automacao' WHERE id = '745469f8-c03c-4159-a684-701ccc7c3112';

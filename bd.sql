--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-04-13 11:40:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 835 (class 1247 OID 32846)
-- Name: branduri_supercar; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.branduri_supercar AS ENUM (
    'Bugatti',
    'Lamborghini',
    'Rimac',
    'Porsche',
    'Ferrari',
    'McLaren',
    'Mercedes-Benz'
);


ALTER TYPE public.branduri_supercar OWNER TO postgres;

--
-- TOC entry 832 (class 1247 OID 32834)
-- Name: categ_supercar; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categ_supercar AS ENUM (
    'editie limitata',
    'clasic',
    'custom',
    'exotic',
    'precomanda'
);


ALTER TYPE public.categ_supercar OWNER TO postgres;

--
-- TOC entry 841 (class 1247 OID 49153)
-- Name: roluri; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roluri AS ENUM (
    'admin',
    'moderator',
    'comun'
);


ALTER TYPE public.roluri OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 49174)
-- Name: accesari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesari (
    id integer NOT NULL,
    ip character varying(100) NOT NULL,
    user_id integer,
    pagina character varying(500) NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accesari OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 49173)
-- Name: accesari_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accesari_id_seq OWNER TO postgres;

--
-- TOC entry 3367 (class 0 OID 0)
-- Dependencies: 215
-- Name: accesari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesari_id_seq OWNED BY public.accesari.id;


--
-- TOC entry 210 (class 1259 OID 24578)
-- Name: produse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produse (
    id integer NOT NULL,
    nume character varying(100) NOT NULL,
    pret double precision DEFAULT 10 NOT NULL
);


ALTER TABLE public.produse OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 24577)
-- Name: produse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.produse ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.produse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 212 (class 1259 OID 32860)
-- Name: supercars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supercars (
    id integer NOT NULL,
    nume character varying(50) NOT NULL,
    descriere text,
    pret numeric(10,2) NOT NULL,
    cai_putere integer NOT NULL,
    model character varying(50) NOT NULL,
    brand public.branduri_supercar DEFAULT 'Ferrari'::public.branduri_supercar,
    capacitate_cilindrica integer NOT NULL,
    categorie public.categ_supercar DEFAULT 'clasic'::public.categ_supercar,
    optiuni_tuning character varying[],
    decapotabil boolean DEFAULT false NOT NULL,
    imagine character varying(300),
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT supercars_cai_putere_check CHECK ((cai_putere >= 0)),
    CONSTRAINT supercars_capacitate_cilindrica_check CHECK ((capacitate_cilindrica >= 0))
);


ALTER TABLE public.supercars OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 32859)
-- Name: supercars_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supercars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.supercars_id_seq OWNER TO postgres;

--
-- TOC entry 3370 (class 0 OID 0)
-- Dependencies: 211
-- Name: supercars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supercars_id_seq OWNED BY public.supercars.id;


--
-- TOC entry 214 (class 1259 OID 49160)
-- Name: utilizatori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilizatori (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    nume character varying(100) NOT NULL,
    prenume character varying(100) NOT NULL,
    parola character varying(500) NOT NULL,
    rol public.roluri DEFAULT 'comun'::public.roluri NOT NULL,
    email character varying(100) NOT NULL,
    culoare_chat character varying(50) NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cod character varying(200),
    confirmat_mail boolean DEFAULT false
);


ALTER TABLE public.utilizatori OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 49159)
-- Name: utilizatori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilizatori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilizatori_id_seq OWNER TO postgres;

--
-- TOC entry 3371 (class 0 OID 0)
-- Dependencies: 213
-- Name: utilizatori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilizatori_id_seq OWNED BY public.utilizatori.id;


--
-- TOC entry 3200 (class 2604 OID 49177)
-- Name: accesari id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari ALTER COLUMN id SET DEFAULT nextval('public.accesari_id_seq'::regclass);


--
-- TOC entry 3189 (class 2604 OID 32863)
-- Name: supercars id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supercars ALTER COLUMN id SET DEFAULT nextval('public.supercars_id_seq'::regclass);


--
-- TOC entry 3196 (class 2604 OID 49163)
-- Name: utilizatori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori ALTER COLUMN id SET DEFAULT nextval('public.utilizatori_id_seq'::regclass);


--
-- TOC entry 3361 (class 0 OID 49174)
-- Dependencies: 216
-- Data for Name: accesari; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3355 (class 0 OID 24578)
-- Dependencies: 210
-- Data for Name: produse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.produse (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (1, 'monitor', 500);
INSERT INTO public.produse (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (2, 'mouse', 150);
INSERT INTO public.produse (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (3, 'marker', 10);
INSERT INTO public.produse (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (4, 'bomboana', 10);


--
-- TOC entry 3357 (class 0 OID 32860)
-- Dependencies: 212
-- Data for Name: supercars; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (1, 'Rimac Nevera', 'Capable of exceptional speeds, swift and powerful beyond comprehension, Nevera is a force like no other', 2400000.00, 1914, 'Nevera', 'Rimac', 0, 'exotic', '{spoiler}', false, 'rimac-nevera.jpg', '2022-03-29 23:11:07.715282');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (3, 'Lamborghini Huracan', 'Luxury meets the spirit of Lamborghini inside the Huracan', 250000.00, 640, 'Huracan', 'Lamborghini', 5204, 'clasic', '{spoiler,eleron}', false, 'lamborghini-huracan.jpg', '2022-03-29 23:17:11.612086');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (2, 'Porsche 918 Spyder', 'mid-engined, plug-in hybrid supercar', 845000.00, 887, '918 Spyder', 'Porsche', 4593, 'clasic', '{spoiler,eleron}', false, 'porsche-918spyder.jpg', '2022-03-29 23:14:52.021069');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (4, 'Bugatti Chiron', 'The fastest, most powerful, and exclusive production super sports car', 3300000.00, 1500, 'Chiron', 'Bugatti', 7993, 'editie limitata', '{}', false, 'bugatti-chiron.jpg', '2022-04-06 10:47:03.023681');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (5, 'McLaren 720s', 'The McLaren 720S is a force of nature', 284745.00, 710, '720s', 'McLaren', 3994, 'clasic', '{spoiler,eleron}', false, 'mclaren-720s.jpg', '2022-04-06 10:53:59.877313');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (6, 'McLaren 720s Spider', 'The 720S Spider is the first and only convertible to have a complete carbon-fibre shell', 315000.00, 710, '720s Spider', 'McLaren', 3994, 'clasic', '{spoiler,eleron}', true, 'mclaren-720s-spider.jpg', '2022-04-06 10:55:39.818125');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (7, 'Ferrari SF90 Stradale', 'A brilliant encapsulation of the most advanced technologies developed', 507000.00, 780, 'SF90 Stradale', 'Ferrari', 3990, 'exotic', '{}', false, 'ferrari-sf90-stradale.jpg', '2022-04-06 11:01:14.711751');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (8, 'Ferrari 296 GTB', 'An evolution of Ferrari’s mid-rear-engined two-seater sports berlinetta concept', 320000.00, 818, '296 GTB', 'Ferrari', 2992, 'clasic', '{spoiler}', false, 'ferrari-296-gtb.jpg', '2022-04-06 11:16:06.289306');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (9, 'Mercedes-Benz AMG GT R', 'The Mercedes-AMG GT combines the fascination of an authentic sports car with segment-specific technology leadership', 157000.00, 577, 'AMG GT R', 'Mercedes-Benz', 3982, 'clasic', '{eleron,diffuser}', false, 'mercedes-amg-gtr.jpg', '2022-04-06 11:31:45.616142');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (10, 'Porsche 911 GT3 RS', 'The Porsche 911 GT3 RS is a one-of-a-kind Porsche', 188550.00, 520, '911 GT3 RS', 'Porsche', 3996, 'clasic', '{eleron,diffuser,spoiler}', false, 'porsche-911-gtr-rs.jpg', '2022-04-06 11:35:28.688471');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (11, 'McLaren Senna', 'Loud and quick, the Senna is a hypercar built to shine at the track', 1000000.00, 789, 'Senna', 'McLaren', 3994, 'editie limitata', '{}', false, 'mclaren-senna.jpg', '2022-04-06 11:41:54.169873');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (12, 'McLaren Artura', 'Artura is defined by ultra-light engineering', 225000.00, 671, 'Artura', 'McLaren', 2993, 'clasic', '{}', false, 'mclaren-artura.jpg', '2022-04-06 11:46:55.425204');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (13, 'McLaren 765LT', 'A supercar that makes track performance a priority and lets most creature comforts fall by the wayside', 388800.00, 755, '765LT', 'McLaren', 3994, 'exotic', '{spoiler,eleron}', false, 'mclaren-765lt.jpg', '2022-04-06 11:50:29.16512');
INSERT INTO public.supercars (id, nume, descriere, pret, cai_putere, model, brand, capacitate_cilindrica, categorie, optiuni_tuning, decapotabil, imagine, data_adaugare) VALUES (14, 'McLaren 765LT Spider', 'The 765LT Spider is alive with driver focused engineering and technology', 388800.00, 755, '765LT', 'McLaren', 3994, 'editie limitata', '{spoiler,eleron}', true, 'mclaren-765lt.jpg', '2022-04-06 11:51:32.308226');


--
-- TOC entry 3359 (class 0 OID 49160)
-- Dependencies: 214
-- Data for Name: utilizatori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.utilizatori (id, username, nume, prenume, parola, rol, email, culoare_chat, data_adaugare, cod, confirmat_mail) VALUES (1, 'andrei', 'Gogulescu', 'Gogu', '982c0fc8ddae94d598d176f3b322b6caf10fb59cd3f9f35300c76490a8bd0b085d272bfbe40ba0880a9a317147b42b175b21bd8187e8aa57ab44ede82e7768ee', 'comun', 'profprofprof007@gmail.com', 'red', '2022-04-11 17:56:57.69486', NULL, false);


--
-- TOC entry 3372 (class 0 OID 0)
-- Dependencies: 215
-- Name: accesari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesari_id_seq', 1, false);


--
-- TOC entry 3373 (class 0 OID 0)
-- Dependencies: 209
-- Name: produse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produse_id_seq', 4, true);


--
-- TOC entry 3374 (class 0 OID 0)
-- Dependencies: 211
-- Name: supercars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supercars_id_seq', 14, true);


--
-- TOC entry 3375 (class 0 OID 0)
-- Dependencies: 213
-- Name: utilizatori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilizatori_id_seq', 1, true);


--
-- TOC entry 3213 (class 2606 OID 49182)
-- Name: accesari accesari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_pkey PRIMARY KEY (id);


--
-- TOC entry 3203 (class 2606 OID 24583)
-- Name: produse produse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produse
    ADD CONSTRAINT produse_pkey PRIMARY KEY (id);


--
-- TOC entry 3205 (class 2606 OID 32875)
-- Name: supercars supercars_nume_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supercars
    ADD CONSTRAINT supercars_nume_key UNIQUE (nume);


--
-- TOC entry 3207 (class 2606 OID 32873)
-- Name: supercars supercars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supercars
    ADD CONSTRAINT supercars_pkey PRIMARY KEY (id);


--
-- TOC entry 3209 (class 2606 OID 49170)
-- Name: utilizatori utilizatori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_pkey PRIMARY KEY (id);


--
-- TOC entry 3211 (class 2606 OID 49172)
-- Name: utilizatori utilizatori_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_username_key UNIQUE (username);


--
-- TOC entry 3214 (class 2606 OID 49183)
-- Name: accesari accesari_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilizatori(id);


--
-- TOC entry 3368 (class 0 OID 0)
-- Dependencies: 210
-- Name: TABLE produse; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.produse TO andreih;


--
-- TOC entry 3369 (class 0 OID 0)
-- Dependencies: 209
-- Name: SEQUENCE produse_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.produse_id_seq TO andreih;


-- Completed on 2022-04-13 11:40:00

--
-- PostgreSQL database dump complete
--


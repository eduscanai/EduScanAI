interface BnccTopic {
  id: string
  school_id: string
  subject_id: string
  name: string
  description: string | null
  bncc_code: string | null
  grade_level: string | null
}

interface BnccSkill {
  id: string
  school_id: string
  topic_id: string
  code: string | null
  description: string
  grade_level: string | null
}

// Tópicos BNCC padrão por disciplina (baseados no nome)
const BNCC_DEFAULTS: Record<string, { name: string; description: string; grade_level: string }[]> = {
  'Matemática': [
    { name: 'Números', description: 'Operações, frações, decimais, porcentagem, pensamento numérico', grade_level: '1-EM' },
    { name: 'Álgebra', description: 'Padrões, sequências, equações, funções, pensamento algébrico', grade_level: '1-EM' },
    { name: 'Geometria', description: 'Figuras planas e espaciais, simetria, plano cartesiano, transformações', grade_level: '1-EM' },
    { name: 'Grandezas e Medidas', description: 'Comprimento, massa, tempo, temperatura, área, capacidade, volume', grade_level: '1-EM' },
    { name: 'Probabilidade e Estatística', description: 'Gráficos, tabelas, média, probabilidade, coleta e análise de dados', grade_level: '1-EM' }
  ],
  'Língua Portuguesa': [
    { name: 'Leitura/Escuta', description: 'Interpretação de textos, gêneros textuais, estratégias de leitura', grade_level: '1-EM' },
    { name: 'Produção de Textos', description: 'Escrita de gêneros diversos, planejamento, revisão e edição', grade_level: '1-EM' },
    { name: 'Oralidade', description: 'Escuta ativa, apresentações, debates, intercâmbios orais', grade_level: '1-EM' },
    { name: 'Análise Linguística/Semiótica', description: 'Gramática, ortografia, pontuação, morfologia, sintaxe', grade_level: '1-EM' }
  ],
  'Português': [
    { name: 'Leitura/Escuta', description: 'Interpretação de textos, gêneros textuais, estratégias de leitura', grade_level: '1-EM' },
    { name: 'Produção de Textos', description: 'Escrita de gêneros diversos, planejamento, revisão e edição', grade_level: '1-EM' },
    { name: 'Oralidade', description: 'Escuta ativa, apresentações, debates, intercâmbios orais', grade_level: '1-EM' },
    { name: 'Análise Linguística/Semiótica', description: 'Gramática, ortografia, pontuação, morfologia, sintaxe', grade_level: '1-EM' }
  ],
  'Ciências': [
    { name: 'Matéria e Energia', description: 'Propriedades, transformações químicas, forças, eletricidade, luz e som', grade_level: '1-9' },
    { name: 'Vida e Evolução', description: 'Seres vivos, corpo humano, ecossistemas, saúde, hereditariedade', grade_level: '1-9' },
    { name: 'Terra e Universo', description: 'Sistema solar, clima, solo, água, fenômenos naturais, astronomia', grade_level: '1-9' }
  ],
  'Física': [
    { name: 'Matéria e Energia', description: 'Fontes de energia, conservação de energia, radiações, equilíbrio termodinâmico', grade_level: 'EM' },
    { name: 'Movimento e Forças', description: 'Leis de Newton, gravitação, cinemática, dinâmica, trabalho e potência', grade_level: 'EM' },
    { name: 'Ondas e Eletromagnetismo', description: 'Ondas mecânicas e eletromagnéticas, óptica, circuitos elétricos, campo magnético', grade_level: 'EM' },
    { name: 'Tecnologia e Sociedade', description: 'Impactos da tecnologia, telecomunicações, energia nuclear, sustentabilidade energética', grade_level: 'EM' }
  ],
  'Química': [
    { name: 'Matéria e suas Transformações', description: 'Estrutura atômica, tabela periódica, ligações químicas, reações químicas', grade_level: 'EM' },
    { name: 'Compostos e Funções Químicas', description: 'Funções orgânicas e inorgânicas, nomenclatura, propriedades', grade_level: 'EM' },
    { name: 'Termodinâmica e Equilíbrio', description: 'Termoquímica, cinética, equilíbrio químico, eletroquímica', grade_level: 'EM' },
    { name: 'Química e Sociedade', description: 'Química ambiental, materiais, fármacos, polímeros, sustentabilidade', grade_level: 'EM' }
  ],
  'Biologia': [
    { name: 'Vida e Evolução', description: 'Origem da vida, evolução, genética, biotecnologia, biodiversidade', grade_level: 'EM' },
    { name: 'Ecologia e Sustentabilidade', description: 'Ecossistemas, fluxo de energia, ciclos biogeoquímicos, impactos ambientais', grade_level: 'EM' },
    { name: 'Corpo Humano e Saúde', description: 'Fisiologia humana, imunologia, doenças, saúde pública', grade_level: 'EM' },
    { name: 'Biologia Celular e Molecular', description: 'Célula, metabolismo, DNA, RNA, síntese proteica, divisão celular', grade_level: 'EM' }
  ],
  'Geografia': [
    { name: 'O sujeito e seu lugar no mundo', description: 'Identidade, pertencimento, relações sociais e culturais', grade_level: '1-EM' },
    { name: 'Conexões e escalas', description: 'Relações local-global, redes urbanas, fluxos migratórios', grade_level: '1-EM' },
    { name: 'Mundo do trabalho', description: 'Produção, economia, tecnologia, recursos naturais', grade_level: '1-EM' },
    { name: 'Formas de representação e pensamento espacial', description: 'Mapas, cartografia, coordenadas, escalas', grade_level: '1-EM' },
    { name: 'Natureza, ambientes e qualidade de vida', description: 'Meio ambiente, sustentabilidade, biomas, clima', grade_level: '1-EM' }
  ],
  'História': [
    { name: 'Mundo pessoal: meu lugar no mundo', description: 'Memória, identidade, temporalidade, fontes históricas', grade_level: '1-2' },
    { name: 'A comunidade e seus registros', description: 'Comunidade, município, patrimônio cultural', grade_level: '3-5' },
    { name: 'Lógicas de organização política', description: 'Cidadania, Estado, democracia, direitos e deveres', grade_level: '6-EM' },
    { name: 'Registros e marcos da história', description: 'Fontes históricas, periodização, cronologia', grade_level: '1-EM' },
    { name: 'As questões históricas', description: 'Trabalho, cultura, migrações, relações de poder', grade_level: '6-EM' }
  ],
  'Arte': [
    { name: 'Artes Visuais', description: 'Pintura, escultura, fotografia, cinema, arte digital', grade_level: '1-EM' },
    { name: 'Dança', description: 'Movimento corporal, coreografia, expressão artística', grade_level: '1-EM' },
    { name: 'Música', description: 'Ritmo, melodia, harmonia, instrumentos, apreciação musical', grade_level: '1-EM' },
    { name: 'Teatro', description: 'Improvisação, dramatização, jogos teatrais, produção cênica', grade_level: '1-EM' }
  ],
  'Educação Física': [
    { name: 'Brincadeiras e Jogos', description: 'Jogos populares, cooperativos, competitivos e de tabuleiro', grade_level: '1-9' },
    { name: 'Esportes', description: 'Esportes individuais, coletivos, de marca, precisão e invasão', grade_level: '1-EM' },
    { name: 'Ginásticas', description: 'Ginástica geral, de condicionamento e consciência corporal', grade_level: '1-EM' },
    { name: 'Danças', description: 'Danças populares, regionais, de salão e contemporâneas', grade_level: '1-EM' },
    { name: 'Lutas', description: 'Lutas brasileiras, indígenas e de outros países', grade_level: '3-EM' },
    { name: 'Práticas corporais de aventura', description: 'Atividades na natureza e urbanas de aventura', grade_level: '6-EM' }
  ],
  'Inglês': [
    { name: 'Oralidade', description: 'Compreensão e produção oral, pronúncia, fluência', grade_level: '6-EM' },
    { name: 'Leitura', description: 'Estratégias de leitura, gêneros textuais em inglês', grade_level: '6-EM' },
    { name: 'Escrita', description: 'Produção de textos escritos em inglês', grade_level: '6-EM' },
    { name: 'Conhecimentos linguísticos', description: 'Gramática, vocabulário, estruturas da língua', grade_level: '6-EM' },
    { name: 'Dimensão intercultural', description: 'Cultura, diversidade, comunicação intercultural', grade_level: '6-EM' }
  ],
  'Língua Inglesa': [
    { name: 'Oralidade', description: 'Compreensão e produção oral, pronúncia, fluência', grade_level: '6-EM' },
    { name: 'Leitura', description: 'Estratégias de leitura, gêneros textuais em inglês', grade_level: '6-EM' },
    { name: 'Escrita', description: 'Produção de textos escritos em inglês', grade_level: '6-EM' },
    { name: 'Conhecimentos linguísticos', description: 'Gramática, vocabulário, estruturas da língua', grade_level: '6-EM' },
    { name: 'Dimensão intercultural', description: 'Cultura, diversidade, comunicação intercultural', grade_level: '6-EM' }
  ],
  'Sociologia': [
    { name: 'Indivíduo e Sociedade', description: 'Socialização, cultura, identidade, relações sociais, instituições', grade_level: 'EM' },
    { name: 'Trabalho e Desigualdade', description: 'Classes sociais, estratificação, trabalho, desigualdade social e econômica', grade_level: 'EM' },
    { name: 'Política e Cidadania', description: 'Estado, democracia, movimentos sociais, participação política, direitos humanos', grade_level: 'EM' },
    { name: 'Cultura e Diversidade', description: 'Diversidade cultural, etnocentrismo, relativismo, indústria cultural, mídia', grade_level: 'EM' }
  ],
  'Filosofia': [
    { name: 'Conhecimento e Verdade', description: 'Epistemologia, racionalismo, empirismo, ciência, senso comum', grade_level: 'EM' },
    { name: 'Ética e Moral', description: 'Valores, virtudes, deontologia, utilitarismo, bioética', grade_level: 'EM' },
    { name: 'Política e Justiça', description: 'Estado, poder, liberdade, justiça social, democracia, contrato social', grade_level: 'EM' },
    { name: 'Estética e Existência', description: 'Arte, beleza, existencialismo, fenomenologia, sentido da vida', grade_level: 'EM' }
  ],
  'Ensino Religioso': [
    { name: 'Identidades e alteridades', description: 'O eu, o outro e o nós; imanência e transcendência; sentimentos, lembranças, memórias e saberes', grade_level: '1-5' },
    { name: 'Manifestações religiosas', description: 'Sentidos pessoais e coletivos; espaços e territórios sagrados; símbolos religiosos; ritos e celebrações', grade_level: '1-9' },
    { name: 'Crenças religiosas e filosofias de vida', description: 'Narrativas sagradas, mitos, ancestralidade, tradição oral, ideias de divindade, vida e morte nas tradições religiosas', grade_level: '1-9' }
  ]
}

// Habilidades BNCC padrão por unidade temática
const BNCC_SKILLS_DEFAULTS: Record<string, Record<string, { code: string; description: string; grade_level: string }[]>> = {
  'Matemática': {
    'Números': [
      { code: 'EF01MA01', description: 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas', grade_level: '1' },
      { code: 'EF02MA01', description: 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal', grade_level: '2' },
      { code: 'EF03MA01', description: 'Ler, escrever e comparar números naturais de até a ordem de unidade de milhar', grade_level: '3' },
      { code: 'EF04MA01', description: 'Ler, escrever e ordenar números naturais até a ordem de dezenas de milhar', grade_level: '4' },
      { code: 'EF05MA02', description: 'Ler, escrever e ordenar números racionais na forma decimal com compreensão das principais características do sistema de numeração decimal', grade_level: '5' },
      { code: 'EF06MA01', description: 'Comparar, ordenar, ler e escrever números naturais e números racionais cuja representação decimal é finita, fazendo uso da reta numérica', grade_level: '6' },
      { code: 'EF07MA04', description: 'Resolver e elaborar problemas que envolvam operações com números inteiros', grade_level: '7' },
      { code: 'EF08MA01', description: 'Efetuar cálculos com potências de expoentes inteiros e aplicar esse conhecimento na representação de números em notação científica', grade_level: '8' },
      { code: 'EF09MA01', description: 'Reconhecer que, uma vez fixada uma unidade de comprimento, existem segmentos de reta cujo comprimento não é expresso por número racional', grade_level: '9' },
      { code: 'EM13MAT101', description: 'Interpretar criticamente situações econômicas, sociais e fatos relativos às Ciências da Natureza que envolvam a variação de grandezas, pela análise dos gráficos das funções representadas e das taxas de variação', grade_level: 'EM' },
      { code: 'EM13MAT104', description: 'Interpretar taxas e índices de natureza socioeconômica (índice de desenvolvimento humano, taxas de inflação, entre outros), investigando os processos de cálculo desses números', grade_level: 'EM' }
    ],
    'Álgebra': [
      { code: 'EF01MA09', description: 'Organizar e ordenar objetos familiares ou representações por figuras, por meio de atributos, tais como cor, forma e medida', grade_level: '1' },
      { code: 'EF03MA10', description: 'Identificar regularidades em sequências ordenadas de números naturais, resultantes da realização de adições ou subtrações sucessivas', grade_level: '3' },
      { code: 'EF05MA11', description: 'Resolver e elaborar problemas cuja conversão em sentença matemática seja uma igualdade com uma operação em que um dos termos é desconhecido', grade_level: '5' },
      { code: 'EF06MA14', description: 'Reconhecer que a relação de igualdade matemática não se altera ao adicionar, subtrair, multiplicar ou dividir os seus dois membros por um mesmo número', grade_level: '6' },
      { code: 'EF07MA13', description: 'Compreender a ideia de variável, representada por letra ou símbolo, para expressar relação entre duas grandezas', grade_level: '7' },
      { code: 'EF08MA08', description: 'Resolver e elaborar problemas relacionados ao seu contexto próximo, que possam ser representados por sistemas de equações de 1º grau com duas incógnitas', grade_level: '8' },
      { code: 'EF09MA06', description: 'Compreender as funções como relações de dependência unívoca entre duas variáveis e suas representações numérica, algébrica e gráfica', grade_level: '9' },
      { code: 'EM13MAT301', description: 'Resolver e elaborar problemas do cotidiano, da Matemática e de outras áreas do conhecimento, que envolvem equações lineares simultâneas, usando técnicas algébricas e gráficas', grade_level: 'EM' },
      { code: 'EM13MAT302', description: 'Construir modelos empregando as funções polinomiais de 1º ou 2º graus, para resolver problemas em contextos diversos, com ou sem apoio de tecnologias digitais', grade_level: 'EM' },
      { code: 'EM13MAT303', description: 'Interpretar e comparar situações que envolvam juros simples com as que envolvem juros compostos, por meio de representações gráficas ou análise de planilhas', grade_level: 'EM' }
    ],
    'Geometria': [
      { code: 'EF01MA11', description: 'Descrever a localização de pessoas e de objetos no espaço em relação à sua própria posição, utilizando termos como à direita, à esquerda, em frente, atrás', grade_level: '1' },
      { code: 'EF03MA13', description: 'Associar figuras geométricas espaciais (cubo, bloco retangular, pirâmide, cone, cilindro e esfera) a objetos do mundo físico', grade_level: '3' },
      { code: 'EF05MA16', description: 'Associar figuras espaciais a suas planificações (prismas, pirâmides, cilindros e cones) e analisar, nomear e comparar seus atributos', grade_level: '5' },
      { code: 'EF06MA19', description: 'Identificar características dos triângulos e classificá-los em relação às medidas dos lados e dos ângulos', grade_level: '6' },
      { code: 'EF07MA21', description: 'Reconhecer e construir figuras obtidas por simetrias de translação, rotação e reflexão', grade_level: '7' },
      { code: 'EF08MA15', description: 'Construir, utilizando instrumentos de desenho ou softwares, mediatriz, bissetriz, ângulos de 90°, 60°, 45° e 30°', grade_level: '8' },
      { code: 'EF09MA11', description: 'Resolver problemas por meio do estabelecimento de relações entre arcos, ângulos centrais e ângulos inscritos na circunferência', grade_level: '9' },
      { code: 'EM13MAT201', description: 'Propor ou participar de ações adequadas às demandas da região, preferencialmente com base em dados e evidências, utilizando conceitos de geometria, estatística e probabilidade', grade_level: 'EM' },
      { code: 'EM13MAT309', description: 'Resolver e elaborar problemas que envolvem o cálculo de áreas totais e de volumes de prismas, pirâmides e corpos redondos', grade_level: 'EM' }
    ],
    'Grandezas e Medidas': [
      { code: 'EF01MA15', description: 'Comparar comprimentos, capacidades ou massas, utilizando termos como mais alto, mais baixo, mais comprido, mais curto', grade_level: '1' },
      { code: 'EF03MA17', description: 'Reconhecer que o resultado de uma medida depende da unidade de medida utilizada', grade_level: '3' },
      { code: 'EF05MA19', description: 'Resolver e elaborar problemas envolvendo medidas das grandezas comprimento, área, massa, tempo, temperatura e capacidade', grade_level: '5' },
      { code: 'EF06MA24', description: 'Resolver e elaborar problemas que envolvam as grandezas comprimento, massa, tempo, temperatura, área e capacidade', grade_level: '6' },
      { code: 'EF07MA29', description: 'Resolver e elaborar problemas que envolvam medidas de grandezas inseridos em contextos oriundos de situações cotidianas', grade_level: '7' },
      { code: 'EF09MA15', description: 'Descrever, por escrito e por meio de um fluxograma, um algoritmo para a construção de um polígono regular', grade_level: '9' },
      { code: 'EM13MAT306', description: 'Resolver e elaborar problemas em contextos que envolvem fenômenos periódicos reais, como ondas sonoras, correntes alternadas, marés, ciclos biogeoquímicos', grade_level: 'EM' }
    ],
    'Probabilidade e Estatística': [
      { code: 'EF01MA20', description: 'Classificar eventos envolvendo o acaso, tais como "acontecerá com certeza", "talvez aconteça" e "é impossível acontecer"', grade_level: '1' },
      { code: 'EF02MA22', description: 'Comparar informações de pesquisas apresentadas por meio de tabelas de dupla entrada e em gráficos de colunas simples ou barras', grade_level: '2' },
      { code: 'EF05MA24', description: 'Interpretar dados estatísticos apresentados em textos, tabelas e gráficos, referentes a outras áreas do conhecimento', grade_level: '5' },
      { code: 'EF06MA31', description: 'Identificar as variáveis e suas frequências e os elementos constitutivos (título, eixos, legendas, fontes e datas) em diferentes tipos de gráfico', grade_level: '6' },
      { code: 'EF07MA35', description: 'Compreender, em contextos significativos, o significado de média estatística como indicador da tendência de uma pesquisa', grade_level: '7' },
      { code: 'EF08MA22', description: 'Calcular a probabilidade de eventos, com base na construção do espaço amostral, utilizando o princípio multiplicativo', grade_level: '8' },
      { code: 'EF09MA20', description: 'Reconhecer, em experimentos aleatórios, eventos independentes e dependentes e calcular a probabilidade de sua ocorrência', grade_level: '9' },
      { code: 'EM13MAT102', description: 'Analisar tabelas, gráficos e amostras de pesquisas estatísticas apresentadas em relatórios divulgados por diferentes meios de comunicação, identificando, quando for o caso, inadequações que possam induzir a erros de interpretação', grade_level: 'EM' },
      { code: 'EM13MAT311', description: 'Identificar e descrever o espaço amostral de eventos aleatórios, realizando contagem das possibilidades, para resolver e elaborar problemas que envolvem o cálculo da probabilidade', grade_level: 'EM' }
    ]
  },
  'Língua Portuguesa': {
    'Leitura/Escuta': [
      { code: 'EF15LP01', description: 'Identificar a função social de textos que circulam em campos da vida social dos quais participa cotidianamente', grade_level: '1-5' },
      { code: 'EF15LP02', description: 'Estabelecer expectativas em relação ao texto que vai ler, apoiando-se em seus conhecimentos prévios', grade_level: '1-5' },
      { code: 'EF15LP03', description: 'Localizar informações explícitas em textos', grade_level: '1-5' },
      { code: 'EF69LP01', description: 'Diferenciar liberdade de expressão de discursos de ódio, posicionando-se contrariamente a esse tipo de discurso', grade_level: '6-9' },
      { code: 'EF69LP03', description: 'Identificar, em notícias, o fato central, suas principais circunstâncias e eventuais decorrências', grade_level: '6-9' },
      { code: 'EF67LP01', description: 'Analisar a estrutura e funcionamento dos hiperlinks em textos noticiosos publicados na Web', grade_level: '6-7' },
      { code: 'EM13LP01', description: 'Relacionar o texto, tanto na produção como na leitura/escuta, com suas condições de produção e seu contexto sócio-histórico de circulação', grade_level: 'EM' },
      { code: 'EM13LP02', description: 'Estabelecer relações entre as partes do texto, tanto na produção como na leitura/escuta, considerando a construção composicional e o estilo do gênero', grade_level: 'EM' }
    ],
    'Produção de Textos': [
      { code: 'EF15LP05', description: 'Planejar, com a ajuda do professor, o texto que será produzido, considerando a situação comunicativa', grade_level: '1-5' },
      { code: 'EF15LP06', description: 'Reler e revisar o texto produzido com a ajuda do professor e a colaboração dos colegas', grade_level: '1-5' },
      { code: 'EF69LP06', description: 'Produzir e publicar notícias, fotodenúncias, fotorreportagens, reportagens multimidiáticas, infográficos, podcasts noticiosos', grade_level: '6-9' },
      { code: 'EF69LP07', description: 'Produzir textos em diferentes gêneros, considerando sua adequação ao contexto produção e circulação', grade_level: '6-9' },
      { code: 'EM13LP03', description: 'Analisar relações de intertextualidade e interdiscursividade que permitam a explicitação de relações dialógicas, a identificação de posicionamentos ou de perspectivas', grade_level: 'EM' },
      { code: 'EM13LP04', description: 'Estabelecer relações de interdiscursividade e intertextualidade para explicitar, sustentar e qualificar posicionamentos', grade_level: 'EM' }
    ],
    'Oralidade': [
      { code: 'EF15LP09', description: 'Expressar-se em situações de intercâmbio oral com clareza, preocupando-se em ser compreendido pelo interlocutor', grade_level: '1-5' },
      { code: 'EF15LP10', description: 'Escutar, com atenção, falas de professores e colegas, formulando perguntas pertinentes ao tema', grade_level: '1-5' },
      { code: 'EF69LP10', description: 'Produzir notícias para rádios, TV ou vídeos, podcasts noticiosos e de opinião, entrevistas, comentários', grade_level: '6-9' },
      { code: 'EF69LP13', description: 'Engajar-se e contribuir com a busca de conclusões comuns relativas a problemas, temas ou questões polêmicas de interesse da turma', grade_level: '6-9' },
      { code: 'EM13LP11', description: 'Fazer curadoria de informação, tendo em vista diferentes propósitos e projetos discursivos', grade_level: 'EM' }
    ],
    'Análise Linguística/Semiótica': [
      { code: 'EF01LP02', description: 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética', grade_level: '1' },
      { code: 'EF02LP01', description: 'Utilizar, ao produzir o texto, grafia correta de palavras conhecidas ou com estruturas silábicas já dominadas', grade_level: '2' },
      { code: 'EF03LP04', description: 'Usar acento gráfico (agudo ou circunflexo) em monossílabos tônicos terminados em a, e, o e em palavras oxítonas', grade_level: '3' },
      { code: 'EF67LP32', description: 'Escrever palavras com correção ortográfica, obedecendo as convenções da língua escrita', grade_level: '6-7' },
      { code: 'EF08LP04', description: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: ortografia, regências e concordâncias, modos e tempos verbais, pontuação', grade_level: '8' },
      { code: 'EM13LP06', description: 'Analisar efeitos de sentido decorrentes de usos expressivos da linguagem, da escolha de determinadas palavras ou expressões e da ordenação, combinação e contraposição de palavras, dentre outros', grade_level: 'EM' }
    ]
  },
  'Ciências': {
    'Matéria e Energia': [
      { code: 'EF01CI01', description: 'Comparar características de diferentes materiais presentes em objetos de uso cotidiano', grade_level: '1' },
      { code: 'EF02CI01', description: 'Identificar de que materiais (metais, madeira, vidro etc.) são feitos os objetos que fazem parte da vida cotidiana', grade_level: '2' },
      { code: 'EF04CI01', description: 'Identificar misturas na vida diária, com base em suas propriedades físicas observáveis', grade_level: '4' },
      { code: 'EF06CI01', description: 'Classificar como homogênea ou heterogênea a mistura de dois ou mais materiais', grade_level: '6' },
      { code: 'EF08CI01', description: 'Identificar e classificar diferentes fontes (renováveis e não renováveis) e tipos de energia', grade_level: '8' },
      { code: 'EF09CI01', description: 'Investigar as mudanças de estado físico da matéria e explicar essas transformações com base no modelo de constituição submicroscópica', grade_level: '9' }
    ],
    'Vida e Evolução': [
      { code: 'EF01CI04', description: 'Comparar características físicas entre os colegas, reconhecendo a diversidade e a importância da valorização e do respeito às diferenças', grade_level: '1' },
      { code: 'EF03CI04', description: 'Identificar características sobre o modo de vida dos animais mais comuns no ambiente próximo', grade_level: '3' },
      { code: 'EF05CI06', description: 'Selecionar argumentos que justifiquem por que os sistemas digestório e respiratório são considerados corresponsáveis pelo processo de nutrição', grade_level: '5' },
      { code: 'EF06CI05', description: 'Explicar a organização básica das células e seu papel como unidade estrutural e funcional dos seres vivos', grade_level: '6' },
      { code: 'EF07CI07', description: 'Caracterizar os principais ecossistemas brasileiros quanto à paisagem, à quantidade de água, ao tipo de solo, à disponibilidade de luz solar', grade_level: '7' },
      { code: 'EF09CI08', description: 'Associar os gametas à transmissão das características hereditárias, estabelecendo relações entre ancestrais e descendentes', grade_level: '9' }
    ],
    'Terra e Universo': [
      { code: 'EF01CI05', description: 'Identificar e nomear diferentes escalas de tempo: os períodos diários e a sucessão de dias, semanas, meses e anos', grade_level: '1' },
      { code: 'EF03CI07', description: 'Identificar características da Terra (como seu formato esférico, a presença de água, solo etc.)', grade_level: '3' },
      { code: 'EF05CI10', description: 'Identificar algumas constelações no céu, com o apoio de recursos, como mapas celestes e aplicativos digitais', grade_level: '5' },
      { code: 'EF06CI11', description: 'Identificar as diferentes camadas que estruturam o planeta Terra (da estrutura interna à atmosfera) e suas principais características', grade_level: '6' },
      { code: 'EF08CI12', description: 'Justificar, por meio da construção de modelos e da observação da Lua no céu, a ocorrência das fases da Lua e dos eclipses', grade_level: '8' },
      { code: 'EF09CI14', description: 'Descrever a composição e a estrutura do Sistema Solar (Sol, planetas rochosos, planetas gigantes gasosos e corpos menores)', grade_level: '9' }
    ]
  },
  'Geografia': {
    'O sujeito e seu lugar no mundo': [
      { code: 'EF01GE01', description: 'Descrever características observadas de seus lugares de vivência e identificar semelhanças e diferenças entre esses lugares', grade_level: '1' },
      { code: 'EF03GE01', description: 'Identificar e comparar aspectos culturais dos grupos sociais de seus lugares de vivência', grade_level: '3' },
      { code: 'EF06GE01', description: 'Comparar modificações das paisagens nos lugares de vivência e os usos desses lugares em diferentes tempos', grade_level: '6' },
      { code: 'EF08GE01', description: 'Descrever as rotas de dispersão da população humana pelo planeta e os principais fluxos migratórios', grade_level: '8' },
      { code: 'EM13CHS101', description: 'Identificar, analisar e comparar diferentes fontes e narrativas expressas em diversas linguagens, com vistas à compreensão de ideias, valores e suas relações com o contexto histórico, geográfico, econômico, político e social', grade_level: 'EM' }
    ],
    'Conexões e escalas': [
      { code: 'EF01GE03', description: 'Identificar e relatar semelhanças e diferenças de usos do espaço público para o lazer e diferentes manifestações', grade_level: '1' },
      { code: 'EF04GE04', description: 'Reconhecer especificidades e analisar a interdependência do campo e da cidade', grade_level: '4' },
      { code: 'EF06GE03', description: 'Descrever os movimentos do planeta e sua relação com a circulação geral da atmosfera e os padrões climáticos', grade_level: '6' },
      { code: 'EF09GE05', description: 'Analisar fatos e situações para compreender a integração mundial (econômica, política e cultural)', grade_level: '9' },
      { code: 'EM13CHS201', description: 'Analisar e caracterizar as dinâmicas das populações, das mercadorias e do capital nos diversos continentes, com destaque para a mobilidade e a fixação de pessoas', grade_level: 'EM' }
    ],
    'Mundo do trabalho': [
      { code: 'EF02GE06', description: 'Relacionar o dia e a noite a diferentes tipos de atividades sociais', grade_level: '2' },
      { code: 'EF04GE07', description: 'Comparar as características do trabalho no campo e na cidade', grade_level: '4' },
      { code: 'EF06GE06', description: 'Identificar as características das paisagens transformadas pelo trabalho humano a partir do desenvolvimento da agropecuária e do processo de industrialização', grade_level: '6' },
      { code: 'EF09GE10', description: 'Analisar os impactos do processo de industrialização na produção e no consumo de energia', grade_level: '9' },
      { code: 'EM13CHS301', description: 'Problematizar hábitos e práticas individuais e coletivos de produção, reaproveitamento e descarte de resíduos em metrópoles, áreas urbanas e rurais', grade_level: 'EM' }
    ],
    'Formas de representação e pensamento espacial': [
      { code: 'EF01GE08', description: 'Criar mapas mentais e desenhos com base em itinerários, contos literários, histórias inventadas e brincadeiras', grade_level: '1' },
      { code: 'EF03GE06', description: 'Identificar e interpretar imagens bidimensionais e tridimensionais em diferentes tipos de representação cartográfica', grade_level: '3' },
      { code: 'EF06GE08', description: 'Medir distâncias na superfície pelas escalas gráficas e numéricas dos mapas', grade_level: '6' },
      { code: 'EF07GE09', description: 'Interpretar e elaborar mapas temáticos e históricos, inclusive utilizando tecnologias digitais', grade_level: '7' }
    ],
    'Natureza, ambientes e qualidade de vida': [
      { code: 'EF01GE10', description: 'Descrever características de seus lugares de vivência relacionadas aos ritmos da natureza', grade_level: '1' },
      { code: 'EF04GE11', description: 'Identificar as características das paisagens naturais e antrópicas no ambiente em que vive', grade_level: '4' },
      { code: 'EF06GE11', description: 'Analisar distintas interações das sociedades com a natureza, com base na distribuição dos componentes físico-naturais', grade_level: '6' },
      { code: 'EF09GE13', description: 'Analisar a importância da produção agropecuária na sociedade urbano-industrial ante o problema da desigualdade mundial de acesso aos recursos alimentares', grade_level: '9' },
      { code: 'EM13CHS306', description: 'Contextualizar, comparar e avaliar os impactos de diferentes modelos socioeconômicos no uso dos recursos naturais e na promoção da sustentabilidade econômica e socioambiental do planeta', grade_level: 'EM' }
    ]
  },
  'História': {
    'Mundo pessoal: meu lugar no mundo': [
      { code: 'EF01HI01', description: 'Identificar aspectos do seu crescimento por meio do registro das lembranças particulares ou de lembranças dos membros de sua família', grade_level: '1' },
      { code: 'EF01HI02', description: 'Identificar a relação entre as suas histórias e as histórias de sua família e de sua comunidade', grade_level: '1' },
      { code: 'EF02HI01', description: 'Reconhecer espaços de sociabilidade e identificar os motivos que aproximam e separam as pessoas em diferentes grupos sociais', grade_level: '2' }
    ],
    'A comunidade e seus registros': [
      { code: 'EF03HI01', description: 'Identificar os grupos populacionais que formam a cidade, o município e a região, e os eventos que marcam a formação da cidade', grade_level: '3' },
      { code: 'EF04HI01', description: 'Reconhecer a história como resultado da ação do ser humano no tempo e no espaço, com base na identificação de mudanças e permanências', grade_level: '4' },
      { code: 'EF05HI01', description: 'Identificar os processos de formação das culturas e dos povos, relacionando-os com o espaço geográfico ocupado', grade_level: '5' }
    ],
    'Lógicas de organização política': [
      { code: 'EF06HI01', description: 'Identificar diferentes formas de compreensão da noção de tempo e de periodização dos processos históricos', grade_level: '6' },
      { code: 'EF07HI01', description: 'Explicar o significado de "modernidade" e suas lógicas de inclusão e exclusão', grade_level: '7' },
      { code: 'EF08HI01', description: 'Identificar os principais marcos históricos do processo de construção do Estado brasileiro', grade_level: '8' },
      { code: 'EF09HI01', description: 'Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos da emergência da República no Brasil', grade_level: '9' },
      { code: 'EM13CHS401', description: 'Identificar e analisar as relações entre sujeitos, grupos, classes sociais e sociedades com culturas distintas diante das transformações técnicas, tecnológicas e informacionais', grade_level: 'EM' },
      { code: 'EM13CHS501', description: 'Analisar os fundamentos da ética em diferentes culturas, tempos e espaços, identificando processos que contribuem para a formação de sujeitos éticos', grade_level: 'EM' }
    ],
    'Registros e marcos da história': [
      { code: 'EF01HI05', description: 'Identificar semelhanças e diferenças entre jogos e brincadeiras atuais e de outras épocas e lugares', grade_level: '1' },
      { code: 'EF03HI04', description: 'Identificar os patrimônios históricos e culturais de sua cidade ou região', grade_level: '3' },
      { code: 'EF06HI02', description: 'Identificar a gênese da produção do saber histórico e analisar o significado das fontes que originaram determinadas formas de registro', grade_level: '6' }
    ],
    'As questões históricas': [
      { code: 'EF06HI14', description: 'Identificar e analisar diferentes formas de contato, adaptação ou exclusão entre populações em diferentes tempos e espaços', grade_level: '6' },
      { code: 'EF07HI09', description: 'Analisar os diferentes impactos da conquista europeia da América para as populações ameríndias e identificar as formas de resistência', grade_level: '7' },
      { code: 'EF08HI19', description: 'Formular questionamentos sobre o legado da escravidão nas Américas, com base na seleção e consulta de fontes de diferentes naturezas', grade_level: '8' },
      { code: 'EF09HI21', description: 'Identificar e relacionar as dinâmicas do capitalismo e suas crises, os grandes conflitos mundiais e os conflitos vivenciados na Europa', grade_level: '9' },
      { code: 'EM13CHS601', description: 'Identificar e analisar as demandas e os protagonismos políticos, sociais e culturais dos povos indígenas e das populações afrodescendentes no Brasil contemporâneo', grade_level: 'EM' },
      { code: 'EM13CHS602', description: 'Identificar e caracterizar a presença do paternalismo, do machismo, do racismo e de outras formas de discriminação em diferentes sociedades e períodos', grade_level: 'EM' }
    ]
  },
  'Inglês': {
    'Oralidade': [
      { code: 'EF06LI01', description: 'Interagir em situações de intercâmbio oral, demonstrando iniciativa para utilizar a língua inglesa', grade_level: '6' },
      { code: 'EF07LI01', description: 'Interagir em situações de intercâmbio oral sobre assuntos familiares, expressando sentimentos e opiniões', grade_level: '7' },
      { code: 'EF08LI01', description: 'Fazer uso da língua inglesa para resolver mal-entendidos, emitir opiniões e esclarecer informações', grade_level: '8' },
      { code: 'EF09LI01', description: 'Fazer uso da língua inglesa para expor pontos de vista, argumentos e contra-argumentos', grade_level: '9' },
      { code: 'EM13LGG401', description: 'Analisar criticamente textos de modo a compreender e caracterizar as línguas como fenômeno (geo)político, histórico, social, cultural, variável, heterogêneo e sensível aos contextos de uso', grade_level: 'EM' }
    ],
    'Leitura': [
      { code: 'EF06LI07', description: 'Formular hipóteses sobre a finalidade de um texto em língua inglesa, com base em sua estrutura e pistas gráficas', grade_level: '6' },
      { code: 'EF07LI06', description: 'Antecipar o sentido global de textos em língua inglesa por inferências', grade_level: '7' },
      { code: 'EF08LI05', description: 'Inferir informações e relações que não aparecem de modo explícito no texto', grade_level: '8' },
      { code: 'EF09LI05', description: 'Identificar recursos de persuasão utilizados nos textos publicitários e de propaganda', grade_level: '9' },
      { code: 'EM13LI01', description: 'Explorar o caráter multilíngue e multicultural da sociedade brasileira e de outros países, valorizando a diversidade linguística', grade_level: 'EM' }
    ],
    'Escrita': [
      { code: 'EF06LI14', description: 'Organizar ideias, selecionando-as em função da estrutura e do objetivo do texto', grade_level: '6' },
      { code: 'EF07LI12', description: 'Planejar a escrita de textos em função do contexto (público, finalidade, layout e suporte)', grade_level: '7' },
      { code: 'EF08LI10', description: 'Reconstruir o texto, com cortes, acréscimos, reformulações e correções', grade_level: '8' },
      { code: 'EF09LI11', description: 'Utilizar recursos verbais e não verbais para construção da persuasão em textos da esfera publicitária', grade_level: '9' },
      { code: 'EM13LI02', description: 'Produzir textos em língua inglesa (pôsteres, folhetos informativos, campanhas publicitárias, relatos pessoais, entre outros), adequados a distintas situações comunicativas', grade_level: 'EM' }
    ],
    'Conhecimentos linguísticos': [
      { code: 'EF06LI17', description: 'Construir repertório lexical relativo a temas familiares (escola, família, rotina diária, atividades de lazer)', grade_level: '6' },
      { code: 'EF07LI15', description: 'Construir repertório lexical relativo a verbos regulares e irregulares, preposições de tempo e conectores', grade_level: '7' },
      { code: 'EF08LI14', description: 'Utilizar formas verbais do futuro para descrever planos e expectativas e fazer previsões', grade_level: '8' },
      { code: 'EF09LI15', description: 'Empregar, de forma inteligível, as formas verbais em orações condicionais dos tipos 1 e 2 (If-clauses)', grade_level: '9' },
      { code: 'EM13LI03', description: 'Utilizar procedimentos de coesão e coerência textuais na produção de textos em língua inglesa de diferentes gêneros e estilos', grade_level: 'EM' }
    ],
    'Dimensão intercultural': [
      { code: 'EF06LI24', description: 'Investigar o alcance da língua inglesa no mundo: como língua materna e/ou oficial', grade_level: '6' },
      { code: 'EF07LI22', description: 'Explorar modos de falar em língua inglesa, refutando preconceitos e reconhecendo a variação linguística', grade_level: '7' },
      { code: 'EF08LI18', description: 'Construir repertório cultural por meio do contato com manifestações artístico-culturais vinculadas à língua inglesa', grade_level: '8' },
      { code: 'EF09LI18', description: 'Analisar a importância da língua inglesa para o desenvolvimento das ciências e da tecnologia', grade_level: '9' },
      { code: 'EM13LI04', description: 'Negociar sentidos em práticas de leitura, escuta e produção de textos em língua inglesa, posicionando-se de maneira crítica diante de visões de mundo veiculadas nas diversas mídias', grade_level: 'EM' }
    ]
  },
  'Física': {
    'Matéria e Energia': [
      { code: 'EM13CNT101', description: 'Analisar e representar, com ou sem o uso de dispositivos e de aplicativos digitais específicos, as transformações e conservações em sistemas que envolvam quantidade de matéria, de energia e de movimento', grade_level: 'EM' },
      { code: 'EM13CNT103', description: 'Utilizar o conhecimento sobre as radiações e suas origens para avaliar as potencialidades e os riscos de sua aplicação em equipamentos de uso cotidiano, na saúde, no ambiente, na indústria, na agricultura e na geração de energia elétrica', grade_level: 'EM' },
      { code: 'EM13CNT104', description: 'Avaliar os benefícios e os riscos à saúde e ao ambiente, considerando a composição, a toxicidade e a reatividade de diferentes materiais e produtos, como também o nível de exposição a eles', grade_level: 'EM' }
    ],
    'Movimento e Forças': [
      { code: 'EM13CNT201', description: 'Analisar e discutir modelos, teorias e leis propostos em diferentes épocas e culturas para descrever e explicar os fenômenos gravitacionais e eletromagnéticos', grade_level: 'EM' },
      { code: 'EM13CNT204', description: 'Elaborar explicações, previsões e cálculos a respeito dos movimentos de objetos na Terra, no Sistema Solar e no Universo com base na análise das interações gravitacionais', grade_level: 'EM' }
    ],
    'Ondas e Eletromagnetismo': [
      { code: 'EM13CNT202', description: 'Analisar as diversas formas de manifestação da vida em seus diferentes níveis de organização, bem como as condições ambientais favoráveis e os fatores limitantes a elas', grade_level: 'EM' },
      { code: 'EM13CNT205', description: 'Interpretar resultados e realizar previsões sobre atividades experimentais, fenômenos naturais e processos tecnológicos, com base nas noções de probabilidade e incerteza', grade_level: 'EM' }
    ],
    'Tecnologia e Sociedade': [
      { code: 'EM13CNT301', description: 'Construir questões, elaborar hipóteses, previsões e estimativas, empregar instrumentos de medição e representar e interpretar modelos explicativos, dados e/ou resultados experimentais', grade_level: 'EM' },
      { code: 'EM13CNT309', description: 'Analisar questões socioambientais, políticas e econômicas relativas à dependência do mundo atual em relação aos recursos não renováveis e discutir a necessidade de introdução de alternativas e novas tecnologias energéticas e de materiais', grade_level: 'EM' }
    ]
  },
  'Química': {
    'Matéria e suas Transformações': [
      { code: 'EM13CNT101', description: 'Analisar e representar as transformações e conservações em sistemas que envolvam quantidade de matéria, de energia e de movimento, para elaborar previsões sobre seus comportamentos', grade_level: 'EM' },
      { code: 'EM13CNT203', description: 'Avaliar e prever efeitos de intervenções nos ecossistemas, e seus impactos nos seres vivos e no corpo humano, com base nos mecanismos de manutenção da vida', grade_level: 'EM' }
    ],
    'Compostos e Funções Químicas': [
      { code: 'EM13CNT104', description: 'Avaliar os benefícios e os riscos à saúde e ao ambiente, considerando a composição, a toxicidade e a reatividade de diferentes materiais e produtos', grade_level: 'EM' },
      { code: 'EM13CNT307', description: 'Analisar as propriedades dos materiais para avaliar a adequação de seu uso em diferentes aplicações (industriais, cotidianas, arquitetônicas ou tecnológicas)', grade_level: 'EM' }
    ],
    'Termodinâmica e Equilíbrio': [
      { code: 'EM13CNT302', description: 'Comunicar, para públicos variados, em diversos contextos, resultados de análises, pesquisas e/ou experimentos, elaborando e/ou interpretando textos, gráficos, tabelas, símbolos, códigos, sistemas de classificação e equações', grade_level: 'EM' },
      { code: 'EM13CNT303', description: 'Interpretar textos de divulgação científica que tratem de temáticas das Ciências da Natureza, disponíveis em diferentes mídias', grade_level: 'EM' }
    ],
    'Química e Sociedade': [
      { code: 'EM13CNT305', description: 'Investigar e discutir o uso indevido de conhecimentos das Ciências da Natureza na justificação de processos de discriminação, segregação e privação de direitos individuais e coletivos', grade_level: 'EM' },
      { code: 'EM13CNT309', description: 'Analisar questões socioambientais, políticas e econômicas relativas à dependência do mundo atual em relação aos recursos não renováveis', grade_level: 'EM' }
    ]
  },
  'Biologia': {
    'Vida e Evolução': [
      { code: 'EM13CNT201', description: 'Analisar e discutir modelos, teorias e leis propostos em diferentes épocas e culturas para descrever os fenômenos biológicos', grade_level: 'EM' },
      { code: 'EM13CNT206', description: 'Discutir a importância da preservação e conservação da biodiversidade, considerando parâmetros qualitativos e quantitativos, e avaliar os efeitos da ação humana e das políticas ambientais', grade_level: 'EM' }
    ],
    'Ecologia e Sustentabilidade': [
      { code: 'EM13CNT203', description: 'Avaliar e prever efeitos de intervenções nos ecossistemas, e seus impactos nos seres vivos e no corpo humano, com base nos mecanismos de manutenção da vida', grade_level: 'EM' },
      { code: 'EM13CNT306', description: 'Avaliar os riscos envolvidos em atividades cotidianas, aplicando conhecimentos das Ciências da Natureza, para justificar o uso de equipamentos e recursos, e comportamentos de segurança', grade_level: 'EM' }
    ],
    'Corpo Humano e Saúde': [
      { code: 'EM13CNT207', description: 'Identificar, analisar e discutir vulnerabilidades vinculadas às vivências e aos desafios contemporâneos aos quais as juventudes estão expostas, com vistas ao autocuidado e à saúde mental', grade_level: 'EM' },
      { code: 'EM13CNT310', description: 'Investigar e analisar os efeitos de programas de infraestrutura e demais serviços básicos (saneamento, energia elétrica, transporte, telecomunicações, cobertura vacinal, atendimento primário à saúde e fornecimento de alimentos) na qualidade de vida da população', grade_level: 'EM' }
    ],
    'Biologia Celular e Molecular': [
      { code: 'EM13CNT304', description: 'Analisar e debater situações controversas sobre a aplicação de conhecimentos da área de Ciências da Natureza (testes combusção, testes genéticos, manipulação genética, células-tronco, clonagem, transgênicos)', grade_level: 'EM' },
      { code: 'EM13CNT308', description: 'Investigar e analisar o funcionamento de equipamentos elétricos e/ou eletrônicos e sistemas de automação para compreender as tecnologias contemporâneas e avaliar seus impactos sociais, culturais e ambientais', grade_level: 'EM' }
    ]
  },
  'Sociologia': {
    'Indivíduo e Sociedade': [
      { code: 'EM13CHS101', description: 'Identificar, analisar e comparar diferentes fontes e narrativas expressas em diversas linguagens, com vistas à compreensão de ideias, valores e suas relações com o contexto histórico, geográfico, econômico, político e social', grade_level: 'EM' },
      { code: 'EM13CHS103', description: 'Elaborar hipóteses, selecionar evidências e compor argumentos relativos a processos políticos, econômicos, sociais, ambientais, culturais e epistemológicos', grade_level: 'EM' }
    ],
    'Trabalho e Desigualdade': [
      { code: 'EM13CHS201', description: 'Analisar e caracterizar as dinâmicas das populações, das mercadorias e do capital nos diversos continentes, com destaque para a mobilidade e a fixação de pessoas', grade_level: 'EM' },
      { code: 'EM13CHS204', description: 'Comparar e avaliar os processos de ocupação do espaço e a formação de territórios, territorialidades e fronteiras, identificando o papel de diferentes agentes e considerando os conflitos populacionais', grade_level: 'EM' }
    ],
    'Política e Cidadania': [
      { code: 'EM13CHS501', description: 'Analisar os fundamentos da ética em diferentes culturas, tempos e espaços, identificando processos que contribuem para a formação de sujeitos éticos que valorizem a liberdade, a cooperação, a autonomia, o empreendedorismo, a convivência democrática e a solidariedade', grade_level: 'EM' },
      { code: 'EM13CHS503', description: 'Identificar diversas formas de violência (física, simbólica, psicológica etc.), suas principais vítimas, suas causas sociais, psicológicas e afetivas, seus significados e usos políticos, sociais e culturais, discutindo e avaliando mecanismos para combatê-las', grade_level: 'EM' },
      { code: 'EM13CHS504', description: 'Analisar e avaliar os impasses ético-políticos decorrentes das transformações culturais, sociais, históricas, científicas e tecnológicas no mundo contemporâneo e seus desdobramentos nas atitudes e nos valores de indivíduos, grupos sociais, sociedades e culturas', grade_level: 'EM' }
    ],
    'Cultura e Diversidade': [
      { code: 'EM13CHS401', description: 'Identificar e analisar as relações entre sujeitos, grupos, classes sociais e sociedades com culturas distintas diante das transformações técnicas, tecnológicas e informacionais', grade_level: 'EM' },
      { code: 'EM13CHS601', description: 'Identificar e analisar as demandas e os protagonismos políticos, sociais e culturais dos povos indígenas e das populações afrodescendentes no Brasil contemporâneo', grade_level: 'EM' },
      { code: 'EM13CHS602', description: 'Identificar e caracterizar a presença do paternalismo, do machismo, do racismo e de outras formas de discriminação em diferentes sociedades e períodos', grade_level: 'EM' }
    ]
  },
  'Filosofia': {
    'Conhecimento e Verdade': [
      { code: 'EM13CHS101', description: 'Identificar, analisar e comparar diferentes fontes e narrativas expressas em diversas linguagens, com vistas à compreensão de ideias filosóficas e seus contextos históricos', grade_level: 'EM' },
      { code: 'EM13CHS103', description: 'Elaborar hipóteses, selecionar evidências e compor argumentos relativos a processos epistemológicos, sociais e culturais', grade_level: 'EM' },
      { code: 'EM13CHS104', description: 'Analisar objetos e vestígios da cultura material e imaterial de modo a identificar conhecimentos, valores, crenças e práticas que caracterizam a identidade e a diversidade cultural', grade_level: 'EM' }
    ],
    'Ética e Moral': [
      { code: 'EM13CHS501', description: 'Analisar os fundamentos da ética em diferentes culturas, tempos e espaços, identificando processos que contribuem para a formação de sujeitos éticos', grade_level: 'EM' },
      { code: 'EM13CHS502', description: 'Analisar situações da vida cotidiana, estilos de vida, valores, condutas etc., desnaturalizando e problematizando formas de desigualdade, preconceito, intolerância e discriminação', grade_level: 'EM' }
    ],
    'Política e Justiça': [
      { code: 'EM13CHS503', description: 'Identificar diversas formas de violência, suas principais vítimas, suas causas sociais, psicológicas e afetivas, discutindo mecanismos para combatê-las', grade_level: 'EM' },
      { code: 'EM13CHS504', description: 'Analisar e avaliar os impasses ético-políticos decorrentes das transformações culturais, sociais, históricas, científicas e tecnológicas no mundo contemporâneo', grade_level: 'EM' },
      { code: 'EM13CHS605', description: 'Analisar os princípios da declaração dos Direitos Humanos, recorrendo às noções de justiça, igualdade e fraternidade, identificar os progressos e entraves à concretização desses direitos', grade_level: 'EM' }
    ],
    'Estética e Existência': [
      { code: 'EM13CHS401', description: 'Identificar e analisar as relações entre sujeitos, grupos e sociedades com culturas distintas diante das transformações técnicas, tecnológicas e informacionais', grade_level: 'EM' },
      { code: 'EM13CHS104', description: 'Analisar objetos da cultura material e imaterial de modo a identificar conhecimentos, valores, crenças e práticas que caracterizam a identidade e a diversidade cultural de diferentes sociedades', grade_level: 'EM' }
    ]
  },
  'Ensino Religioso': {
    'Identidades e alteridades': [
      { code: 'EF01ER01', description: 'Identificar e acolher as semelhanças e diferenças entre o eu, o outro e o nós', grade_level: '1' },
      { code: 'EF01ER02', description: 'Reconhecer que o seu nome e o das demais pessoas os identificam e os diferenciam', grade_level: '1' },
      { code: 'EF02ER01', description: 'Reconhecer os diferentes espaços de convivência e identificar os vínculos afetivos', grade_level: '2' },
      { code: 'EF02ER02', description: 'Identificar costumes, crenças e formas diversas de viver em variados ambientes de convivência', grade_level: '2' },
      { code: 'EF03ER01', description: 'Identificar e respeitar os diferentes espaços e territórios religiosos de diferentes tradições e movimentos religiosos', grade_level: '3' },
      { code: 'EF04ER01', description: 'Identificar ritos presentes no cotidiano pessoal, familiar, escolar e comunitário', grade_level: '4' },
      { code: 'EF05ER01', description: 'Identificar e respeitar acontecimentos sagrados de diferentes culturas e tradições religiosas como recurso para preservar a memória', grade_level: '5' }
    ],
    'Manifestações religiosas': [
      { code: 'EF01ER03', description: 'Reconhecer e respeitar as características físicas e subjetivas de cada um', grade_level: '1' },
      { code: 'EF01ER04', description: 'Valorizar a diversidade de formas de vida', grade_level: '1' },
      { code: 'EF03ER03', description: 'Identificar e respeitar práticas celebrativas (cerimônias, orações, festividades, peregrinações, entre outras) de diferentes tradições religiosas', grade_level: '3' },
      { code: 'EF04ER04', description: 'Identificar as diversas formas de expressão da espiritualidade (orações, cultos, gestos, cantos, dança, meditação) nas diferentes tradições religiosas', grade_level: '4' },
      { code: 'EF05ER03', description: 'Reconhecer funções e mensagens religiosas contidas nos mitos de criação (narrativas de origem, crenças, convicções)', grade_level: '5' },
      { code: 'EF06ER01', description: 'Reconhecer o papel da tradição escrita na preservação de memórias, acontecimentos e ensinamentos religiosos', grade_level: '6' },
      { code: 'EF07ER01', description: 'Reconhecer e respeitar as práticas de comunicação com as divindades em distintas manifestações e tradições religiosas', grade_level: '7' },
      { code: 'EF08ER01', description: 'Discutir como as crenças e convicções podem influenciar escolhas e atitudes pessoais e coletivas', grade_level: '8' },
      { code: 'EF09ER01', description: 'Analisar princípios e orientações para o cuidado da vida e nas diversas tradições religiosas e filosofias de vida', grade_level: '9' }
    ],
    'Crenças religiosas e filosofias de vida': [
      { code: 'EF01ER05', description: 'Identificar e acolher sentimentos, lembranças, memórias e saberes de cada um', grade_level: '1' },
      { code: 'EF01ER06', description: 'Identificar as diferentes formas pelas quais as pessoas manifestam sentimentos, ideias, memórias, gostos e crenças em diferentes espaços', grade_level: '1' },
      { code: 'EF04ER05', description: 'Identificar representações religiosas em diferentes expressões artísticas (pinturas, arquitetura, esculturas, ícones, símbolos, entre outras)', grade_level: '4' },
      { code: 'EF05ER04', description: 'Reconhecer a importância da tradição oral para preservar memórias e acontecimentos religiosos', grade_level: '5' },
      { code: 'EF06ER03', description: 'Reconhecer, em textos escritos, ensinamentos relacionados a modos de ser e viver', grade_level: '6' },
      { code: 'EF07ER04', description: 'Exemplificar líderes religiosos que se destacaram por suas contribuições à sociedade', grade_level: '7' },
      { code: 'EF08ER04', description: 'Discutir como filosofias de vida, tradições e instituições religiosas podem influenciar diferentes campos da esfera pública (política, saúde, educação, economia)', grade_level: '8' },
      { code: 'EF09ER04', description: 'Identificar concepções de vida e morte em diferentes tradições religiosas e filosofias de vida, por meio da análise de diferentes ritos fúnebres', grade_level: '9' },
      { code: 'EF09ER07', description: 'Identificar princípios éticos (alteridade, liberdade, autonomia, responsabilidade) em diferentes tradições religiosas e filosofias de vida, discutindo como podem influenciar condutas pessoais e práticas sociais', grade_level: '9' }
    ]
  }
}

// Copiar aliases
BNCC_SKILLS_DEFAULTS['Português'] = BNCC_SKILLS_DEFAULTS['Língua Portuguesa']
BNCC_SKILLS_DEFAULTS['Língua Inglesa'] = BNCC_SKILLS_DEFAULTS['Inglês']

export const useBnccTopics = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()

  const topics = ref<BnccTopic[]>([])
  const skills = ref<BnccSkill[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTopicsBySubject = async (subjectId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('bncc_topicos')
        .select('*')
        .eq('subject_id', subjectId)
        .order('name')
      if (err) throw err
      topics.value = (data || []) as BnccTopic[]
      return topics.value
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchSkillsByTopic = async (topicId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('bncc_habilidades')
        .select('*')
        .eq('topic_id', topicId)
        .order('code')
      if (err) throw err
      return (data || []) as BnccSkill[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const fetchAllSkillsBySubject = async () => {
    const topicIds = topics.value.map(t => t.id)
    if (topicIds.length === 0) {
      skills.value = []
      return []
    }
    try {
      const { data, error: err } = await supabase
        .from('bncc_habilidades')
        .select('*')
        .in('topic_id', topicIds)
        .order('code')
      if (err) throw err
      skills.value = (data || []) as BnccSkill[]
      return skills.value
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const createTopic = async (topic: { subject_id: string; name: string; description?: string; bncc_code?: string; grade_level?: string }) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('bncc_topicos')
        .insert({
          school_id: usuario.value.schoolId,
          subject_id: topic.subject_id,
          name: topic.name,
          description: topic.description || null,
          bncc_code: topic.bncc_code || null,
          grade_level: topic.grade_level || null
        })
        .select()
        .single()
      if (err) throw err
      return data as BnccTopic
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTopic = async (id: string, updates: Partial<Pick<BnccTopic, 'name' | 'description' | 'bncc_code' | 'grade_level'>>) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('bncc_topicos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      return data as BnccTopic
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTopic = async (id: string) => {
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('bncc_topicos')
        .delete()
        .eq('id', id)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const createSkill = async (skill: { topic_id: string; code?: string; description: string; grade_level?: string }) => {
    if (!usuario.value.schoolId) return
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('bncc_habilidades')
        .insert({
          school_id: usuario.value.schoolId,
          topic_id: skill.topic_id,
          code: skill.code || null,
          description: skill.description,
          grade_level: skill.grade_level || null
        })
        .select()
        .single()
      if (err) throw err
      return data as BnccSkill
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateSkill = async (id: string, updates: Partial<Pick<BnccSkill, 'code' | 'description' | 'grade_level'>>) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('bncc_habilidades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      return data as BnccSkill
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteSkill = async (id: string) => {
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('bncc_habilidades')
        .delete()
        .eq('id', id)
      if (err) throw err
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Popular tópicos + habilidades BNCC padrão (topicNames opcional para filtrar)
  const seedBnccDefaults = async (subjectId: string, subjectName: string, topicNames?: string[]) => {
    if (!usuario.value.schoolId) return 0
    let defaults = BNCC_DEFAULTS[subjectName]
    if (!defaults || defaults.length === 0) return 0

    if (topicNames && topicNames.length > 0) {
      const set = new Set(topicNames)
      defaults = defaults.filter(d => set.has(d.name))
    }
    if (defaults.length === 0) return 0

    loading.value = true
    try {
      // 1. Inserir tópicos (unidades temáticas)
      const inserts = defaults.map(d => ({
        school_id: usuario.value.schoolId,
        subject_id: subjectId,
        name: d.name,
        description: d.description,
        grade_level: d.grade_level
      }))
      const { data: topicsData, error: err } = await supabase
        .from('bncc_topicos')
        .insert(inserts)
        .select()
      if (err) throw err
      topics.value = (topicsData || []) as BnccTopic[]

      // 2. Inserir habilidades para cada tópico
      const skillsDefaults = BNCC_SKILLS_DEFAULTS[subjectName]
      if (skillsDefaults && topicsData) {
        const skillInserts: any[] = []
        for (const topic of topicsData as BnccTopic[]) {
          const topicSkills = skillsDefaults[topic.name]
          if (topicSkills) {
            for (const s of topicSkills) {
              skillInserts.push({
                school_id: usuario.value.schoolId,
                topic_id: topic.id,
                code: s.code,
                description: s.description,
                grade_level: s.grade_level
              })
            }
          }
        }
        if (skillInserts.length > 0) {
          const { data: skillsData, error: skillErr } = await supabase
            .from('bncc_habilidades')
            .insert(skillInserts)
            .select()
          if (skillErr) throw skillErr
          skills.value = (skillsData || []) as BnccSkill[]
        }
      }

      return topicsData?.length || 0
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getDefaults = (subjectName: string) => BNCC_DEFAULTS[subjectName] || []
  const getSkillDefaults = (subjectName: string) => BNCC_SKILLS_DEFAULTS[subjectName] || {}

  // Lista de disciplinas BNCC disponíveis (sem aliases duplicados)
  const bnccDisciplinas = [
    'Matemática', 'Língua Portuguesa', 'Ciências', 'História', 'Geografia',
    'Língua Inglesa', 'Educação Física', 'Arte', 'Ensino Religioso',
    'Física', 'Química', 'Biologia', 'Sociologia', 'Filosofia'
  ]

  return {
    topics, skills, loading, error,
    fetchTopicsBySubject, fetchSkillsByTopic, fetchAllSkillsBySubject,
    createTopic, updateTopic, deleteTopic,
    createSkill, updateSkill, deleteSkill,
    seedBnccDefaults, getDefaults, getSkillDefaults, bnccDisciplinas
  }
}

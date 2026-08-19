<template>
  <div>
    <!-- Cabecalho -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink
        to="/teacher/assignments"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors no-underline"
      >
        <Icone :tamanho="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Icone>
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-heading-1">{{ atividade?.titulo || 'Detalhes da Atividade' }}</h1>
        <p class="text-body text-text-secondary mt-1">
          {{ atividade?.turmas?.name }}{{ atividade?.disciplinas?.name ? ' · ' + atividade.disciplinas.name : '' }}
          <span v-if="atividade" :class="['ml-2 text-xs px-2 py-0.5 rounded-full font-medium', classeStatusAtividade]">
            {{ rotuloStatusAtividade }}
          </span>
        </p>
      </div>
      <div v-if="atividade" class="flex items-center gap-2">
        <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', classeStatus(atividade.status)]">
          {{ rotuloStatus(atividade.status) }}
        </span>
        <!-- Toggle visibilidade -->
        <button
          v-if="canCreateAssignments && atividade.status !== 'draft'"
          @click="alternarVisibilidade"
          :class="[
            'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5',
            atividade.visivel_aluno
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          <Icone :tamanho="14">
            <path v-if="atividade.visivel_aluno" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </Icone>
          {{ atividade.visivel_aluno ? 'Visivel' : 'Oculta' }}
        </button>
        <button
          v-if="canCreateAssignments && atividade.status === 'draft'"
          @click="publicar"
          :disabled="processando"
          class="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="processando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ processando ? 'Publicando...' : 'Publicar' }}
        </button>
        <button
          v-if="canCreateAssignments && atividade.status === 'published'"
          @click="encerrar"
          :disabled="processando"
          class="btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {{ processando ? 'Encerrando...' : 'Encerrar' }}
        </button>
      </div>
    </div>

    <Carregando v-if="carregando" texto="Carregando..." />

    <div v-else-if="atividade" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Conteudo principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Materiais da prova objetiva -->
        <Cartao v-if="atividade.tipo === 'objetiva'">
          <h2 class="text-heading-3 mb-4">Materiais da prova objetiva</h2>
          <div v-if="atividade.descricao" class="mb-5">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Descricao</p>
            <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.descricao"></div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              :disabled="carregandoUrlObjetiva === 'folha'"
              @click="baixarMaterialObjetiva('folha')"
              class="btn-outline text-sm disabled:opacity-50"
            >
              Baixar folha de respostas
            </button>
            <button
              :disabled="carregandoUrlObjetiva === 'solucao'"
              @click="baixarMaterialObjetiva('solucao')"
              class="btn-outline text-sm disabled:opacity-50"
            >
              Baixar solução (gabarito marcado)
            </button>
            <button
              :disabled="carregandoUrlObjetiva === 'todas'"
              @click="baixarTodasAsFolhasObjetiva"
              class="btn-outline text-sm disabled:opacity-50"
            >
              Baixar todas as folhas (turma inteira)
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-3">
            {{ (atividade.atividade_objetiva?.questoes || []).length }} questões · valor {{ atividade.nota_maxima }} ·
            {{ atividade.atividade_objetiva?.matricula_em_blocos ? 'com' : 'sem' }} matrícula em blocos
          </p>
        </Cartao>

        <!-- Atividade + Gabarito (mesmo cartao) -->
        <Cartao v-else>
          <h2 class="text-heading-3 mb-4">Atividade e Gabarito</h2>

          <!-- Descricao -->
          <div v-if="atividade.descricao" class="mb-5">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Descricao</p>
            <div class="prose prose-sm max-w-none text-gray-700" v-html="atividade.descricao"></div>
          </div>

          <!-- Anexos da atividade -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase mb-2">Anexos da Atividade</p>
              <div v-if="(atividade.anexos || []).length" class="space-y-2">
                <a
                  v-for="(anexo, i) in atividade.anexos"
                  :key="'att-'+i"
                  :href="anexo.url"
                  target="_blank"
                  class="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 no-underline bg-primary-50 px-3 py-2 rounded-lg"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </Icone>
                  {{ anexo.name }}
                </a>
              </div>
              <p v-else class="text-sm text-gray-400">Nenhum anexo</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-medium text-gray-500 uppercase">Gabarito</p>
                <button
                  v-if="!editandoGabarito && canCreateAssignments"
                  @click="editandoGabarito = true"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  {{ (atividade.gabarito || []).length ? 'Alterar' : '+ Adicionar' }}
                </button>
              </div>

              <div v-if="(atividade.gabarito || []).length && !editandoGabarito" class="space-y-2">
                <a
                  v-for="(anexo, i) in atividade.gabarito"
                  :key="'gab-'+i"
                  :href="anexo.url"
                  target="_blank"
                  class="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 no-underline bg-green-50 px-3 py-2 rounded-lg"
                >
                  <Icone :tamanho="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </Icone>
                  {{ anexo.name }}
                </a>
              </div>
              <p v-else-if="!editandoGabarito" class="text-sm text-gray-400">Nenhum gabarito</p>

              <div v-if="editandoGabarito" class="space-y-3">
                <UploadArquivo
                  v-model="novoGabarito"
                  rotulo=""
                  bucket="assignments-files"
                  :pasta="`${atividade.turma_id}/gabaritos`"
                />
                <div class="flex gap-2">
                  <button
                    @click="salvarGabarito"
                    :disabled="salvandoGabarito || novoGabarito.length === 0"
                    class="btn-primary text-sm flex-1"
                  >
                    {{ salvandoGabarito ? 'Salvando...' : 'Salvar Gabarito' }}
                  </button>
                  <button
                    @click="editandoGabarito = false; novoGabarito = []"
                    class="btn-outline text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Cartao>

        <!-- Aguardando confirmação (prova objetiva) -->
        <Cartao v-if="atividade.tipo === 'objetiva' && pendentesObjetiva.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Aguardando confirmação ({{ pendentesObjetiva.length }})</h2>
            <button :disabled="confirmandoTodosObjetiva" @click="confirmarTodosPendentesObjetiva" class="btn-outline text-sm disabled:opacity-50">
              {{ confirmandoTodosObjetiva ? 'Confirmando...' : 'Confirmar todos' }}
            </button>
          </div>
          <p class="text-sm text-text-secondary mb-4">
            Resultado do lote ainda não é oficial pro aluno — confira a nota e a folha antes de confirmar.
          </p>

          <div class="space-y-3">
            <div v-for="submissao in pendentesObjetiva" :key="submissao.id" class="border border-gray-200 rounded-lg p-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ submissao.perfis?.full_name || 'Aluno' }}</p>
                  <p class="text-xs text-gray-500">
                    Nota detectada: <span class="font-semibold">{{ submissao.nota ?? '—' }}</span>
                    <span v-if="submissao.envio_objetivo?.percentual != null"> ({{ submissao.envio_objetivo.percentual }}%)</span>
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    v-if="submissao.envio_objetivo?.imagem_processada_url"
                    @click="verImagemObjetiva(submissao.envio_objetivo.imagem_processada_url)"
                    class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Ver folha
                  </button>
                  <button @click="alternarEdicaoObjetiva(submissao)" class="text-xs text-gray-500 hover:text-primary-600 font-medium">
                    {{ editandoEnvioIdObjetiva === submissao.id ? 'Fechar edição' : 'Editar respostas' }}
                  </button>
                  <button
                    :disabled="processandoEnvioIdObjetiva === submissao.id + '-rejeitar'"
                    @click="rejeitarObjetiva(submissao)"
                    class="btn-outline text-sm text-critical-600 disabled:opacity-50"
                  >
                    Rejeitar
                  </button>
                  <button
                    :disabled="processandoEnvioIdObjetiva === submissao.id + '-confirmar'"
                    @click="confirmarObjetiva(submissao)"
                    class="btn-primary text-sm disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              </div>

              <div v-if="editandoEnvioIdObjetiva === submissao.id" class="mt-3 pt-3 border-t border-gray-100">
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                  <div v-for="questao in atividade.atividade_objetiva?.questoes || []" :key="questao.numero">
                    <label class="block text-[10px] text-gray-500 mb-0.5">Questão {{ questao.numero }}</label>
                    <select v-model="respostasEditadasObjetiva[`q${questao.numero}`]" class="form-input py-1 text-xs">
                      <option value="">em branco</option>
                      <option v-for="letra in alternativasDeObjetiva(questao.option_count)" :key="letra" :value="letra">{{ letra }}</option>
                    </select>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="btn-outline text-sm" @click="editandoEnvioIdObjetiva = null">Cancelar</button>
                  <button :disabled="salvandoRespostasObjetiva" class="btn-primary text-sm disabled:opacity-50" @click="salvarRespostasObjetiva(submissao)">
                    {{ salvandoRespostasObjetiva ? 'Salvando...' : 'Salvar e recalcular nota' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Cartao>

        <!-- Alunos -->
        <Cartao>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading-3">Alunos</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>{{ totalEntregues }}/{{ alunosComStatus.length }} entregues</span>
              <span>{{ validadas }} validada{{ validadas !== 1 ? 's' : '' }}</span>
              <span v-if="aguardandoValidacao > 0" class="text-purple-600">
                {{ aguardandoValidacao }} aguardando validacao
              </span>
            </div>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="aluno in alunosComStatus"
              :key="aluno.id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <Avatar
                  :alt="aluno.nome"
                  :image="aluno.avatar"
                  :size="36"
                />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ aluno.nome }}</p>
                  <p v-if="aluno.submissao" class="text-xs text-gray-500">
                    Enviado em {{ formatarDataHora(aluno.submissao.enviado_em) }}
                    <span v-if="aluno.submissao.status_processamento === 'processando'" class="ml-1 text-amber-600">(processando IA...)</span>
                    <span v-if="aluno.submissao.status_processamento === 'erro'" class="ml-1 text-critical-500">(erro na correcao)</span>
                  </p>
                  <p v-else class="text-xs text-gray-400">Ainda nao entregou</p>
                </div>
              </div>
              <!-- Prova objetiva: status simplificado + acoes de folha (sem IA/validacao manual) -->
              <div v-if="atividade.tipo === 'objetiva'" class="flex items-center gap-3">
                <span
                  v-if="aluno.submissao"
                  :class="['text-xs px-2 py-0.5 rounded-full font-medium', classeStatusObjetiva(aluno.submissao.status_processamento)]"
                >
                  {{ rotuloStatusObjetiva(aluno.submissao.status_processamento) }}
                </span>
                <span v-else class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Pendente</span>
                <span v-if="aluno.submissao?.status_processamento === 'corrigido'" class="text-sm font-semibold text-green-600">
                  {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                </span>
                <button
                  :disabled="carregandoUrlObjetiva === `folha-${aluno.id}`"
                  @click="baixarFolhaAlunoObjetiva(aluno.id)"
                  class="text-xs text-gray-500 hover:text-primary-600 font-medium disabled:opacity-50"
                >
                  Baixar folha
                </button>
                <button
                  v-if="aluno.submissao?.envio_objetivo?.imagem_processada_url"
                  @click="verImagemObjetiva(aluno.submissao.envio_objetivo.imagem_processada_url)"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  Ver folha
                </button>
                <label
                  :class="[
                    'text-xs font-medium cursor-pointer',
                    enviandoAlunoObjetiva === aluno.id ? 'text-gray-400 pointer-events-none' : 'text-gray-500 hover:text-primary-600'
                  ]"
                >
                  {{ enviandoAlunoObjetiva === aluno.id ? 'Enviando...' : 'Enviar folha' }}
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" class="hidden" @change="enviarFolhaAlunoObjetiva(aluno.id, $event)" />
                </label>
              </div>
              <div v-else class="flex items-center gap-3">
                <!-- Corrigida pela IA + Validada -->
                <template v-if="aluno.submissao?.corrigido_em && aluno.submissao?.validado_professor">
                  <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                    Validada
                  </span>
                  <span class="text-sm font-semibold text-green-600">
                    {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Ver
                  </NuxtLink>
                </template>
                <!-- Corrigida pela IA, aguardando validacao (envio do aluno) -->
                <template v-else-if="aluno.submissao?.corrigido_em && aluno.submissao?.status_processamento === 'corrigido'">
                  <span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                    IA corrigiu
                  </span>
                  <span class="text-sm font-semibold text-purple-600">
                    {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-primary text-xs px-3 py-1 no-underline"
                  >
                    Validar
                  </NuxtLink>
                </template>
                <!-- Corrigida manualmente -->
                <template v-else-if="aluno.submissao?.corrigido_em">
                  <span class="text-sm font-semibold text-green-600">
                    {{ aluno.submissao.nota }}/{{ atividade.nota_maxima }}
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Ver
                  </NuxtLink>
                </template>
                <!-- Processando IA -->
                <template v-else-if="aluno.submissao?.status_processamento === 'processando'">
                  <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Processando IA
                  </span>
                </template>
                <!-- Erro na IA -->
                <template v-else-if="aluno.submissao?.status_processamento === 'erro'">
                  <span class="text-xs text-critical-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                    Erro na IA
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Corrigir Manual
                  </NuxtLink>
                </template>
                <!-- Entregue, aguardando correcao IA -->
                <template v-else-if="aluno.submissao">
                  <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Aguardando IA
                  </span>
                  <NuxtLink
                    :to="`/teacher/submissions/${aluno.submissao.id}`"
                    class="btn-outline text-xs px-3 py-1 no-underline"
                  >
                    Corrigir Manual
                  </NuxtLink>
                </template>
                <!-- Nao entregou -->
                <template v-else>
                  <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    Pendente
                  </span>
                </template>
              </div>
            </div>
            <p v-if="alunosComStatus.length === 0" class="py-8 text-center text-sm text-gray-500">
              Nenhum aluno matriculado nesta turma
            </p>
          </div>
        </Cartao>

        <!-- Avaliacao por Habilidade -->
        <Cartao v-if="habilidadesAtividade.length > 0 && alunosComAvaliacao.length > 0">
          <h2 class="text-heading-3 mb-4">Avaliacao por Habilidade</h2>
          <p class="text-xs text-text-secondary mb-4">Resultado da correcao da IA por habilidade BNCC</p>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 pr-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Aluno</th>
                  <th
                    v-for="hab in habilidadesAtividade"
                    :key="hab.id"
                    class="text-center py-2 px-2 text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap max-w-[100px]"
                    :title="hab.bncc_habilidades?.description"
                  >
                    {{ hab.bncc_habilidades?.code || 'Hab.' }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="aluno in alunosComAvaliacao" :key="aluno.id">
                  <td class="py-2 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">{{ aluno.nome }}</td>
                  <td
                    v-for="hab in habilidadesAtividade"
                    :key="hab.bncc_habilidades?.id"
                    class="text-center py-2 px-2"
                  >
                    <span
                      v-if="aluno.avaliacoes[hab.bncc_habilidades?.id]"
                      :class="['inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full', classeNivel(aluno.avaliacoes[hab.bncc_habilidades?.id])]"
                      :title="aluno.avaliacoes[hab.bncc_habilidades?.id + '_obs'] || ''"
                    >
                      {{ rotuloNivel(aluno.avaliacoes[hab.bncc_habilidades?.id]) }}
                    </span>
                    <span v-else class="text-gray-300 text-xs">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legenda -->
          <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <span class="text-[10px] text-gray-500 uppercase font-medium">Legenda:</span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-red-500"></span> Insatisfatorio
            </span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span> Regular
            </span>
            <span class="inline-flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full bg-green-500"></span> Satisfatorio
            </span>
          </div>
        </Cartao>
      </div>

      <!-- Info lateral -->
      <div class="space-y-6">
        <!-- Enviar Respostas (dissertativa) -->
        <Cartao v-if="atividade.tipo === 'dissertativa'">
          <div class="flex items-center gap-2 mb-4">
            <Icone :tamanho="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </Icone>
            <h2 class="text-heading-3">Enviar Respostas</h2>
          </div>
          <p class="text-xs text-text-secondary mb-3">
            Faca upload das respostas dos alunos.
          </p>
          <UploadArquivo
            v-model="loteArquivos"
            rotulo=""
            bucket="submissions-files"
            :pasta="`${assignmentId}/lote`"
          />
          <button
            @click="enviarLote"
            :disabled="enviandoLote || loteArquivos.length === 0"
            class="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-3"
          >
            <svg v-if="enviandoLote" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ enviandoLote ? 'Enviando...' : 'Enviar Respostas' }}
          </button>
        </Cartao>

        <!-- Escanear folhas (objetiva) -->
        <Cartao v-else>
          <div class="flex items-center gap-2 mb-4">
            <Icone :tamanho="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-1.5m-12 0h12m-12 0l1.5-3h9l1.5 3m-13.5 0h13.5" />
            </Icone>
            <h2 class="text-heading-3">Escanear folhas</h2>
          </div>
          <p class="text-xs text-text-secondary mb-3">
            Envie um único PDF com todas as folhas escaneadas da turma (uma folha por página).
          </p>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" class="form-input text-sm" @change="escanearLoteObjetivaHandler" />
          <p v-if="escaneandoLoteObjetiva" class="text-xs text-gray-500 mt-2">Processando folhas...</p>
          <div v-if="resultadoEscaneamentoObjetiva" class="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
            <p>{{ resultadoEscaneamentoObjetiva.total_paginas }} página(s) · {{ resultadoEscaneamentoObjetiva.aguardando_confirmacao }} aguardando confirmação · {{ naoIdentificadosObjetiva.length }} não identificada(s)</p>
          </div>
          <p v-if="erroEscaneamentoObjetiva" class="mt-2 text-xs text-critical-500">{{ erroEscaneamentoObjetiva }}</p>

          <div v-if="naoIdentificadosObjetiva.length > 0" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <p class="text-xs font-medium text-gray-700">Folhas não identificadas — atribua manualmente:</p>
            <div v-for="(pagina, indice) in naoIdentificadosObjetiva" :key="pagina.pagina" class="border border-gray-200 rounded-lg p-2">
              <img v-if="pagina.pagina_base64" :src="`data:image/png;base64,${pagina.pagina_base64}`" :alt="pagina.pagina" class="w-full h-auto rounded border border-gray-200 mb-2" />
              <p class="text-[11px] text-gray-500 mb-2">{{ pagina.motivo }}</p>
              <select v-model="atribuicoesObjetiva[indice]" class="form-input py-1 text-xs mb-2">
                <option value="">Selecione o aluno...</option>
                <option v-for="aluno in alunosComStatus" :key="aluno.id" :value="aluno.id">{{ aluno.nome }}</option>
              </select>
              <button
                :disabled="!atribuicoesObjetiva[indice] || atribuindoObjetiva === indice"
                @click="atribuirObjetiva(indice)"
                class="btn-outline text-xs w-full disabled:opacity-50"
              >
                Atribuir
              </button>
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h2 class="text-heading-3 mb-4">Detalhes</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Valor</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.nota_maxima }} pontos</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Peso</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.peso }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Prazo</p>
              <p class="text-sm text-gray-900 mt-0.5">
                {{ atividade.data_entrega ? formatarDataHora(atividade.data_entrega) : 'Sem prazo' }}
              </p>
            </div>
            <div v-if="atividade.periodos_avaliacao?.name">
              <p class="text-xs font-medium text-gray-500 uppercase">Periodo</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.periodos_avaliacao.name }}</p>
            </div>
            <div v-if="atividade.categorias_avaliacao?.name">
              <p class="text-xs font-medium text-gray-500 uppercase">Categoria</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.categorias_avaliacao.name }}</p>
            </div>
            <div v-if="atividade.publicado_em">
              <p class="text-xs font-medium text-gray-500 uppercase">Publicada em</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ formatarDataHora(atividade.publicado_em) }}</p>
            </div>
            <div v-if="mediaNotas !== null">
              <p class="text-xs font-medium text-gray-500 uppercase">Media da turma</p>
              <p class="text-sm text-gray-900 font-semibold mt-0.5">{{ mediaNotas.toFixed(1) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Modo de envio</p>
              <p class="text-sm text-gray-900 mt-0.5">{{ atividade.modo_envio === 'lote' ? 'Professor envia respostas' : 'Individual (aluno)' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase">Visibilidade</p>
              <p :class="['text-sm mt-0.5 font-medium', atividade.visivel_aluno ? 'text-green-600' : 'text-gray-500']">
                {{ atividade.visivel_aluno ? 'Visivel para alunos' : 'Oculta dos alunos' }}
              </p>
            </div>
          </div>
        </Cartao>

        <!-- Habilidades BNCC -->
        <Cartao v-if="habilidadesAtividade.length > 0">
          <h2 class="text-heading-3 mb-3">Habilidades BNCC</h2>
          <div class="space-y-2">
            <div v-for="h in habilidadesAtividade" :key="h.id" class="text-sm">
              <span v-if="h.bncc_habilidades?.code" class="text-xs font-mono text-primary-600 mr-1">{{ h.bncc_habilidades.code }}</span>
              <span class="text-gray-700">{{ h.bncc_habilidades?.description }}</span>
              <p v-if="h.bncc_habilidades?.bncc_topicos?.name" class="text-[10px] text-gray-400 mt-0.5">
                {{ h.bncc_habilidades.bncc_topicos.name }}
              </p>
            </div>
          </div>
        </Cartao>
      </div>
    </div>

    <Notificacao
      :esta-visivel="notificacao.visivel"
      :variante="notificacao.variante"
      :titulo="notificacao.titulo"
      :mensagem="notificacao.mensagem"
      @fechar="notificacao.visivel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '~/components/ui/Icone/Icone.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import Cartao from '~/components/layout/Cartao/Cartao.vue'
import UploadArquivo from '~/components/form/UploadArquivo/UploadArquivo.vue'
import Notificacao from '~/components/feedback/Notificacao/Notificacao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue', 'teacher', 'collaborator']
})

const { canCreateAssignments } = usePermissions()
const route = useRoute()
const assignmentId = route.params.id as string

const { getAssignment, updateAssignment, publishAssignment, closeAssignment, toggleVisibilidade, fetchHabilidades, fetchAvaliacoesAtividade } = useAssignments()
const { submissions: submissoes, getSubmissionsForAssignment, submitLote } = useSubmissions()
const { fetchClassStudents } = useClasses()
const {
  escanearLoteObjetivo,
  escanearIndividualObjetivo,
  atribuirEnvioObjetivoManual,
  confirmarEnvioObjetivo,
  rejeitarEnvioObjetivo,
  confirmarPendentesObjetivos,
  editarRespostasObjetivo,
  urlAssinadaObjetiva
} = useAtividadesObjetivas()

const carregando = ref(true)
const atividade = ref<any>(null)
const alunosTurma = ref<any[]>([])
const habilidadesAtividade = ref<any[]>([])
const avaliacoesRaw = ref<any[]>([])
const enviandoLote = ref(false)
const loteArquivos = ref<{ name: string; url: string }[]>([])
const editandoGabarito = ref(false)
const novoGabarito = ref<{ name: string; url: string }[]>([])
const salvandoGabarito = ref(false)

const alunosComStatus = computed(() => {
  const subMap = new Map(submissoes.value.map(s => [s.aluno_id, s]))
  return alunosTurma.value
    .map(cs => ({
      id: cs.profiles?.id || cs.perfis?.id || cs.student_id,
      nome: cs.profiles?.full_name || cs.perfis?.full_name || 'Sem nome',
      avatar: cs.profiles?.avatar_url || cs.perfis?.avatar_url || '',
      submissao: subMap.get(cs.profiles?.id || cs.perfis?.id || cs.student_id) || null
    }))
    .sort((a, b) => {
      const pesoA = a.submissao?.corrigido_em ? 0 : a.submissao ? 1 : 2
      const pesoB = b.submissao?.corrigido_em ? 0 : b.submissao ? 1 : 2
      if (pesoA !== pesoB) return pesoA - pesoB
      return a.nome.localeCompare(b.nome)
    })
})

const totalEntregues = computed(() => alunosComStatus.value.filter(a => a.submissao).length)
const validadas = computed(() => submissoes.value.filter(s => s.corrigido_em && (s as any).validado_professor).length)
const aguardandoValidacao = computed(() => submissoes.value.filter(s => s.corrigido_em && s.status_processamento === 'corrigido' && !(s as any).validado_professor).length)
const mediaNotas = computed(() => {
  const notas = submissoes.value.filter(s => s.nota !== null).map(s => s.nota as number)
  if (notas.length === 0) return null
  return notas.reduce((a, b) => a + b, 0) / notas.length
})

// Avaliacao por habilidade: montar tabela aluno x habilidade
const alunosComAvaliacao = computed(() => {
  if (avaliacoesRaw.value.length === 0) return []
  // Agrupar avaliacoes por aluno_id
  const porAluno = new Map<string, Record<string, string>>()
  for (const av of avaliacoesRaw.value) {
    const alunoId = av.envios?.aluno_id
    if (!alunoId) continue
    if (!porAluno.has(alunoId)) porAluno.set(alunoId, {})
    const map = porAluno.get(alunoId)!
    map[av.habilidade_id] = av.nivel
    if (av.observacao) map[av.habilidade_id + '_obs'] = av.observacao
  }
  // Combinar com nomes dos alunos
  return alunosComStatus.value
    .filter(a => porAluno.has(a.id))
    .map(a => ({
      id: a.id,
      nome: a.nome,
      avaliacoes: porAluno.get(a.id) || {}
    }))
})

const rotuloNivel = (nivel: string) => ({
  insatisfatorio: 'I',
  regular: 'R',
  satisfatorio: 'S',
  pendente: '...'
}[nivel] || '-')

const classeNivel = (nivel: string) => ({
  insatisfatorio: 'bg-red-100 text-red-700',
  regular: 'bg-amber-100 text-amber-700',
  satisfatorio: 'bg-green-100 text-green-700',
  pendente: 'bg-gray-100 text-gray-500'
}[nivel] || 'bg-gray-100 text-gray-500')

// Status da atividade: Atrasada / Em andamento / Finalizada
const rotuloStatusAtividade = computed(() => {
  if (!atividade.value) return ''
  if (atividade.value.status === 'closed') return 'Finalizada'
  if (atividade.value.status === 'draft') return 'Rascunho'
  if (atividade.value.data_entrega && new Date(atividade.value.data_entrega) < new Date()) return 'Atrasada'
  return 'Em andamento'
})

const classeStatusAtividade = computed(() => {
  if (!atividade.value) return ''
  if (atividade.value.status === 'closed') return 'bg-green-50 text-green-700'
  if (atividade.value.status === 'draft') return 'bg-gray-100 text-gray-600'
  if (atividade.value.data_entrega && new Date(atividade.value.data_entrega) < new Date()) return 'bg-red-50 text-red-700'
  return 'bg-blue-50 text-blue-700'
})

const processando = ref(false)

const publicar = async () => {
  processando.value = true
  try {
    atividade.value = await publishAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade publicada!')
  } catch { mostrarNotificacao('critico', 'Erro ao publicar') }
  finally { processando.value = false }
}

const encerrar = async () => {
  processando.value = true
  try {
    atividade.value = await closeAssignment(assignmentId)
    mostrarNotificacao('sucesso', 'Atividade encerrada')
  } catch { mostrarNotificacao('critico', 'Erro ao encerrar') }
  finally { processando.value = false }
}

const alternarVisibilidade = async () => {
  try {
    atividade.value = await toggleVisibilidade(assignmentId, !atividade.value.visivel_aluno)
    mostrarNotificacao('sucesso', atividade.value.visivel_aluno ? 'Atividade visivel para alunos' : 'Atividade oculta dos alunos')
  } catch {
    mostrarNotificacao('critico', 'Erro ao alterar visibilidade')
  }
}

// Salvar gabarito
const salvarGabarito = async () => {
  if (novoGabarito.value.length === 0) return
  salvandoGabarito.value = true
  try {
    atividade.value = await updateAssignment(assignmentId, { gabarito: novoGabarito.value } as any)
    editandoGabarito.value = false
    novoGabarito.value = []
    mostrarNotificacao('sucesso', 'Gabarito salvo!')
  } catch {
    mostrarNotificacao('critico', 'Erro ao salvar gabarito')
  } finally {
    salvandoGabarito.value = false
  }
}

// Enviar respostas
const enviarLote = async () => {
  if (loteArquivos.value.length === 0) {
    mostrarNotificacao('critico', 'Faca upload de pelo menos um arquivo')
    return
  }

  enviandoLote.value = true
  try {
    await submitLote(assignmentId, loteArquivos.value)
    loteArquivos.value = []
    mostrarNotificacao('sucesso', 'Respostas enviadas com sucesso!')
    setTimeout(async () => {
      await getSubmissionsForAssignment(assignmentId)
    }, 2000)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao enviar respostas', e.message)
  } finally {
    enviandoLote.value = false
  }
}

// ---- Prova objetiva ----

const rotuloStatusObjetiva = (s?: string) => ({
  pendente: 'Pendente',
  processando: 'Processando',
  aguardando_confirmacao: 'Aguardando confirmação',
  corrigido: 'Corrigido',
  erro: 'Erro'
}[s || ''] || 'Não enviado')

const classeStatusObjetiva = (s?: string) => ({
  pendente: 'bg-gray-100 text-gray-600',
  processando: 'bg-amber-50 text-amber-700',
  aguardando_confirmacao: 'bg-amber-50 text-amber-700',
  corrigido: 'bg-green-50 text-green-700',
  erro: 'bg-critical-50 text-critical-600'
}[s || ''] || 'bg-gray-100 text-gray-400')

const pendentesObjetiva = computed(() =>
  submissoes.value.filter(s => s.status_processamento === 'aguardando_confirmacao')
)

const carregandoUrlObjetiva = ref<string | null>(null)

const baixarMaterialObjetiva = async (tipo: 'folha' | 'solucao') => {
  if (!atividade.value?.atividade_objetiva) return
  carregandoUrlObjetiva.value = tipo
  try {
    const caminho = tipo === 'folha'
      ? atividade.value.atividade_objetiva.folha_respostas_url
      : atividade.value.atividade_objetiva.folha_solucao_url
    const url = await urlAssinadaObjetiva(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Não foi possível gerar o link de download')
  } finally {
    carregandoUrlObjetiva.value = null
  }
}

const baixarTodasAsFolhasObjetiva = async () => {
  if (!atividade.value) return
  carregandoUrlObjetiva.value = 'todas'
  try {
    const caminho = `${atividade.value.escola_id}/atividades/${assignmentId}/gabarito/todas_as_folhas.pdf`
    const url = await urlAssinadaObjetiva(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Arquivo combinado não encontrado')
  } finally {
    carregandoUrlObjetiva.value = null
  }
}

const baixarFolhaAlunoObjetiva = async (alunoId: string) => {
  if (!atividade.value) return
  const chave = `folha-${alunoId}`
  carregandoUrlObjetiva.value = chave
  try {
    const caminho = `${atividade.value.escola_id}/atividades/${assignmentId}/gabarito/alunos/${alunoId}.pdf`
    const url = await urlAssinadaObjetiva(caminho)
    if (url) window.open(url, '_blank')
    else mostrarNotificacao('critico', 'Folha personalizada não encontrada')
  } finally {
    carregandoUrlObjetiva.value = null
  }
}

const verImagemObjetiva = async (caminho: string) => {
  const url = await urlAssinadaObjetiva(caminho, 'submissions-files')
  if (url) window.open(url, '_blank')
}

const enviandoAlunoObjetiva = ref<string | null>(null)

const enviarFolhaAlunoObjetiva = async (alunoId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  const arquivo = input.files?.[0]
  if (!arquivo) return

  enviandoAlunoObjetiva.value = alunoId
  try {
    await escanearIndividualObjetivo(assignmentId, alunoId, arquivo)
    mostrarNotificacao('sucesso', 'Folha enviada e corrigida!')
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao enviar a folha', e?.data?.message || e.message || '')
  } finally {
    enviandoAlunoObjetiva.value = null
    input.value = ''
  }
}

const processandoEnvioIdObjetiva = ref<string | null>(null)
const confirmandoTodosObjetiva = ref(false)

const confirmarObjetiva = async (submissao: any) => {
  processandoEnvioIdObjetiva.value = `${submissao.id}-confirmar`
  try {
    await confirmarEnvioObjetivo(assignmentId, submissao.id)
    mostrarNotificacao('sucesso', 'Resultado confirmado!')
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao confirmar', e?.data?.message || e.message || '')
  } finally {
    processandoEnvioIdObjetiva.value = null
  }
}

const rejeitarObjetiva = async (submissao: any) => {
  processandoEnvioIdObjetiva.value = `${submissao.id}-rejeitar`
  try {
    await rejeitarEnvioObjetivo(assignmentId, submissao.id)
    mostrarNotificacao('sucesso', 'Envio rejeitado — o aluno pode ser reenviado.')
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao rejeitar', e?.data?.message || e.message || '')
  } finally {
    processandoEnvioIdObjetiva.value = null
  }
}

const confirmarTodosPendentesObjetiva = async () => {
  confirmandoTodosObjetiva.value = true
  try {
    const resultado = await confirmarPendentesObjetivos(assignmentId)
    mostrarNotificacao('sucesso', `${resultado.confirmados} envio(s) confirmado(s)!`)
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao confirmar todos', e?.data?.message || e.message || '')
  } finally {
    confirmandoTodosObjetiva.value = false
  }
}

const alternativasDeObjetiva = (optionCount: number) =>
  Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i))

const editandoEnvioIdObjetiva = ref<string | null>(null)
const respostasEditadasObjetiva = ref<Record<string, string>>({})
const salvandoRespostasObjetiva = ref(false)

const alternarEdicaoObjetiva = (submissao: any) => {
  if (editandoEnvioIdObjetiva.value === submissao.id) {
    editandoEnvioIdObjetiva.value = null
    return
  }
  respostasEditadasObjetiva.value = { ...(submissao.envio_objetivo?.respostas_detectadas || {}) }
  editandoEnvioIdObjetiva.value = submissao.id
}

const salvarRespostasObjetiva = async (submissao: any) => {
  salvandoRespostasObjetiva.value = true
  try {
    await editarRespostasObjetivo(assignmentId, submissao.id, respostasEditadasObjetiva.value)
    mostrarNotificacao('sucesso', 'Respostas atualizadas e nota recalculada!')
    editandoEnvioIdObjetiva.value = null
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao salvar respostas', e?.data?.message || e.message || '')
  } finally {
    salvandoRespostasObjetiva.value = false
  }
}

interface PaginaNaoIdentificadaObjetiva {
  pagina: string
  motivo: string
  pagina_base64?: string
}

const escaneandoLoteObjetiva = ref(false)
const erroEscaneamentoObjetiva = ref<string | null>(null)
const resultadoEscaneamentoObjetiva = ref<{ total_paginas: number; aguardando_confirmacao: number } | null>(null)
const naoIdentificadosObjetiva = ref<PaginaNaoIdentificadaObjetiva[]>([])
const atribuicoesObjetiva = ref<Record<number, string>>({})
const atribuindoObjetiva = ref<number | null>(null)

const escanearLoteObjetivaHandler = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const arquivo = input.files?.[0]
  if (!arquivo) return

  erroEscaneamentoObjetiva.value = null
  resultadoEscaneamentoObjetiva.value = null
  naoIdentificadosObjetiva.value = []
  escaneandoLoteObjetiva.value = true

  try {
    const resposta = await escanearLoteObjetivo(assignmentId, arquivo)
    resultadoEscaneamentoObjetiva.value = {
      total_paginas: resposta.total_paginas,
      aguardando_confirmacao: resposta.aguardando_confirmacao
    }
    naoIdentificadosObjetiva.value = resposta.nao_identificados
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    erroEscaneamentoObjetiva.value = e?.data?.message || e.message || 'Erro ao processar o arquivo'
  } finally {
    escaneandoLoteObjetiva.value = false
    input.value = ''
  }
}

const atribuirObjetiva = async (indice: number) => {
  const alunoId = atribuicoesObjetiva.value[indice]
  const pagina = naoIdentificadosObjetiva.value[indice]
  if (!alunoId || !pagina?.pagina_base64) return

  atribuindoObjetiva.value = indice
  try {
    await atribuirEnvioObjetivoManual(assignmentId, alunoId, pagina.pagina_base64, pagina.pagina)
    naoIdentificadosObjetiva.value.splice(indice, 1)
    delete atribuicoesObjetiva.value[indice]
    mostrarNotificacao('sucesso', 'Folha atribuída e corrigida!')
    await getSubmissionsForAssignment(assignmentId)
  } catch (e: any) {
    mostrarNotificacao('critico', 'Erro ao atribuir folha', e?.data?.message || e.message || '')
  } finally {
    atribuindoObjetiva.value = null
  }
}

// Helpers
const rotuloStatus = (s: string) => ({ draft: 'Rascunho', published: 'Publicada', closed: 'Encerrada' }[s] || s)
const classeStatus = (s: string) => ({
  draft: 'bg-gray-100 text-gray-600', published: 'bg-green-50 text-green-700', closed: 'bg-amber-50 text-amber-700'
}[s] || '')

const formatarDataHora = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const notificacao = ref({ visivel: false, variante: 'sucesso' as const, titulo: '', mensagem: '' })
const mostrarNotificacao = (v: 'sucesso' | 'critico', t: string, m = '') => {
  notificacao.value = { visivel: true, variante: v, titulo: t, mensagem: m }
}

onMounted(async () => {
  const [atividadeData] = await Promise.all([
    getAssignment(assignmentId),
    getSubmissionsForAssignment(assignmentId)
  ])
  atividade.value = atividadeData

  if (atividadeData?.turma_id) {
    alunosTurma.value = await fetchClassStudents(atividadeData.turma_id)
  }

  try {
    habilidadesAtividade.value = await fetchHabilidades(assignmentId)
    if (habilidadesAtividade.value.length > 0) {
      avaliacoesRaw.value = await fetchAvaliacoesAtividade(assignmentId)
    }
  } catch { /* silenciar */ }

  carregando.value = false
})
</script>

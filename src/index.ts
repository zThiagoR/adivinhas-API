import express from 'express';
import { writeFileSync } from 'fs';

import data from './adivinhas.json';
import newData from './confirm.json';

const newDataJson: [{
  id: number;
  pergunta: string;
  resposta: string;
}] = JSON.parse(JSON.stringify(newData));

const DataJson: [{
  pergunta: string;
  resposta: string;
}] = JSON.parse(JSON.stringify(data));

const app = express();

app.use(express.json())

app.get('/adivinhas', (req, res) => {
  return res.send({
    message: 'Total de adivinhas: ' + data.length,
    list: data
  });
});

app.post('/adivinhas/send-new', (req, res) => {
  const { pergunta, resposta } = req.body;

  if(!pergunta || !resposta) {
    return res.status(400).send({
      message: 'Pergunta e resposta são obrigatórios'
    })
  }

  if(DataJson.some((item) => item.pergunta === pergunta) || DataJson.some((item) => item.resposta === resposta)) {
    return res.status(400).send({
      message: 'Pergunta ou resposta já existente na lista de adivinhas disponíveis'
    })
  }

  if(newDataJson.some((item) => item.pergunta === pergunta) || newDataJson.some((item) => item.resposta === resposta)) {
    return res.status(400).send({
      message: 'Pergunta ou resposta já existe na lista de confirmação'
    })
  }

  newDataJson.push({
    id: newDataJson.length + 1,
    pergunta,
    resposta
  });

  writeFileSync('./src/confirm.json', JSON.stringify(newDataJson, null, 2));

  return res.send({
    message: 'Adivinha adicionada com sucesso!',
  })
})

app.get('/adivinhas/confirm', (req, res) => {

  if (newData.length === 0) {
    return res.send({
      message: 'Nenhuma adivinha para confirmar',
    })
  }

  return res.send({
    message: 'Total de adivinhas para confirmar: ' + newData.length,
    data: newData
  });
})

app.post('/adivinhas/confirm/:id', (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.status(400).send({
      message: 'ID é obrigatório'
    })
  }

  const findAdivinha = newDataJson.find((item) => item.id === Number(id))

  if(!findAdivinha) {
    return res.status(400).send({
      message: 'ID não existe na lista de confirmação'
    })
  }

  DataJson.push({
    pergunta: findAdivinha.pergunta,
    resposta: findAdivinha.resposta
  });

  newDataJson.splice(newDataJson.indexOf(findAdivinha), 1);

  writeFileSync('./src/confirm.json', JSON.stringify(newDataJson, null, 2));
  writeFileSync('./src/adivinhas.json', JSON.stringify(DataJson, null, 2));

  res.send({
    message: 'Adivinha confirmada com sucesso!',
    list: DataJson.at(-1)
  })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
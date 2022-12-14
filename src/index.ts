import express from 'express';
import { writeFileSync } from 'fs';

import data from './adivinhas.json';
import newData from './confirm.json';

const newDataJson: [{
  id: number;
  question: string;
  answer: string;
}] = JSON.parse(JSON.stringify(newData));

const DataJson: [{
  question: string;
  answer: string;
}] = JSON.parse(JSON.stringify(data));

const app = express();

app.use(express.json())

app.get('/adivinhas', (req, res) => {
  return res.send({
    message: 'Total de adivinhas disponíveis: ' + data.length,
    list: data
  });
});

app.post('/adivinhas/suggestion', (req, res) => {
  const { question, answer } = req.body;

  if(!question || !answer) {
    return res.status(400).send({
      message: 'Pergunta e resposta são obrigatórios'
    })
  }

  if(DataJson.some((item) => item.question === question) || DataJson.some((item) => item.answer === answer)) {
    return res.status(422).send({
      message: 'Pergunta ou resposta já existente na lista de adivinhas disponíveis'
    })
  }

  if(newDataJson.some((item) => item.question === question) || newDataJson.some((item) => item.answer === answer)) {
    return res.status(422).send({
      message: 'Pergunta ou resposta já existe na lista de adivinhas sugeridas'
    })
  }

  newDataJson.push({
    id: newDataJson.length + 1,
    question,
    answer
  });

  writeFileSync('./src/confirm.json', JSON.stringify(newDataJson, null, 2));

  return res.status(201).send({
    message: 'Adivinha adicionada com sucesso!',
  })
})

app.get('/adivinhas/suggestions', (req, res) => {

  if (newData.length === 0) {
    return res.status(204).send({
      message: 'Nenhuma adivinhas foram sugeridas no momento',
    })
  }

  return res.status(200).send({
    message: 'Total de adivinhas sugeridas no momento: ' + newData.length,
    data: newData
  });
})

app.post('/adivinhas/suggestions/confirm/:id', (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.status(400).send({
      message: 'ID no parâmetro é obrigatório'
    })
  }

  const findAdivinha = newDataJson.find((item) => item.id === Number(id))

  if(!findAdivinha) {
    return res.status(400).send({
      message: 'ID não existe na lista de adivinhas sugeridas'
    })
  }

  DataJson.push({
    question: findAdivinha.question,
    answer: findAdivinha.answer
  });

  newDataJson.splice(newDataJson.indexOf(findAdivinha), 1);

  writeFileSync('./src/confirm.json', JSON.stringify(newDataJson, null, 2));
  writeFileSync('./src/adivinhas.json', JSON.stringify(DataJson, null, 2));

  res.status(200).send({
    message: 'Adivinha aprovado com sucesso!',
    list: DataJson.at(-1)
  })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
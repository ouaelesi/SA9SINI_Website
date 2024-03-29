import answerModel from "../models/answer.js";
import questionModel from "../models/question.js";

// add answer
export const addAnswer = (req, res) => {
  if (!req.body) {
    res.sattus(400).send({ message: "request body is empty !!" });
    return;
  }
  const answer = new answerModel({
    answer: req.body.answer,
    creator: req.body.creator,
    question: req.body.question,
    sharedFile: req.body.sharedFile,
    likes: Number(req.body.likes),
  });

  answer
    .save()
    .then((answer) => res.send(answer))
    .catch((err) => res.send({ message: err.message }));

  // Adding the andswer Id to its question
  let newAnswers = [];
  questionModel.findById(req.body.question).then((question) => {
    newAnswers = question.answers;
    // adding the new answer id
    newAnswers.push(answer._id);
    // updating the question's answers
    questionModel
      .findByIdAndUpdate(req.body.question, { answers: newAnswers })
      .then((question) => {
        if (!question) {
          console.log("yaw makanch questions ");
        } else {
          console.log(question);
        }
      });
  });
};

// delete answer
export const deleteAnswer = (req, res) => {
  const id = req.query.id;
  answerModel.findById(id).then((answer) => {
    const questionId = answer.question;
    questionModel.findById(questionId).then((question) => {
      const answersArray = question.answers;
      const index = answersArray.indexOf(id.toString());
      if (index > -1) {
        answersArray.splice(index, 1);
        questionModel
          .findByIdAndUpdate(
            questionId,
            { $set: { answers: answersArray } },
            { new: true, upsert: true }
          )
          .then((question) => {
            if (!question) {
            } else {
              console.log("questiondeleted !!" + question.answers);
            }
          });
      } else {
        console.log(
          "//////////////////////////////////// we are not having the id"
        );
      }
    });
    answerModel
      .findByIdAndDelete(id)
      .then(res.send(`answer ${id} deleted succesfully !!`))
      .catch((err) => {
        res.status(400).send({ massage: err.massage || "error occured" });
      });
  });
};

// get answers
export const getAnswers = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    answerModel
      .findById(id)
      .then((answer) => {
        res.send(answer);
      })
      .catch((err) => {
        res.status(400).send({ message: err.massage });
      });
  } else {
    answerModel.find().then((answers) => {
      res.send(answers);
    });
  }
};

// update answer
export const updateAnswer = (req, res) => {
  const id = req.params.id;

  answerModel
    .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((answer) => {
      res.send(answer);
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
};

//Update Questions Likes
export const updateAnsLikes = (req, res) => {
  const id = req.query.id;
  console.log(id);
  answerModel
    .findOneAndUpdate(
      {
        _id: id,
      },
      {
        $inc: {
          likes: req.body.num,
        },
      }
    )
    .then((answer) => {
      res.send(answer);
    })
    .catch((err) => {
      console.log("ther is an error");
      res.send(err.message);
    });
};

import { IsLoggedIn } from "../../utils/IsLoggedIn";
import questionModal from "../../models/question";
import userQuestionsActions from "../../models/userQuestionActions";

// Save && unsave Question
export const saveQuestion = async (req, res) => {
  try {
    const userEmail = await IsLoggedIn(req);

    if (!userEmail) {
      res.status(400).send({ message: "User Not Logged In!" });
      return;
    }

    // if (!req.body) {
    //   res
    //     .status(400)
    //     .send({ message: "Request body is empty!", data: req.body });
    //   return;
    // }

    // test if the User Has saved this question
    const existingSavedQuestion = await userQuestionsActions.findOne({
      userId: userEmail.email,
      questionId: req.query.id,
    });

    if (!existingSavedQuestion) {
      const newSavedQuestion = new userQuestionsActions({
        userId: userEmail.email,
        questionId: req.query.id,
        saved: true,
      });

      const savedData = await newSavedQuestion.save();
      res.send(savedData);
    } else {
      if (existingSavedQuestion.saved && existingSavedQuestion.note === 0) {
        await userQuestionsActions.deleteOne({
          userId: userEmail.email,
          questionId: req.query.id,
        });
      } else {
        await userQuestionsActions.findOneAndUpdate(
          {
            userId: userEmail.email,
            questionId: req.query.id,
          },
          {
            $set: {
              saved: !existingSavedQuestion.saved,
            },
          }
        );
      }

      res.send({ message: "Question unmarked as saved." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred.", error: error.message });
  }
};

// get the saved question
export const isQuestionSaved = async (req, res) => {
  if (!(await IsLoggedIn(req))) {
    res.status(400).send({ message: "User Not Logged In!" });
    return;
  }

  const userEmail = await IsLoggedIn(req);
  const questionId = req.query.id;

  userQuestionsActions
    .find({ userId: userEmail.email, questionId: questionId })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "some errors occured",
      });
    });
};

// get the saved questions of a user
export const getUserSavedQuestions = async (req, res) => {
  if (!(await IsLoggedIn(req))) {
    res.status(400).send({ message: "User Not Logged In!" });
    return;
  }

  const userEmail = await IsLoggedIn(req);

  userQuestionsActions
    .find({ userId: userEmail.email })
    .then((data) => {
      const questionIds = data.map((question) => question.questionId);
      questionModal
        .find({ _id: { $in: questionIds } })
        .then((data) => res.send(data));
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "some errors occured",
      });
    });
};

import questionModel from "../models/question";
import answerModel from "../models/answer";
import { IsLoggedIn } from "../utils/IsLoggedIn";
import userQuestionsActions from "../models/userQuestionActions";
import ViewedQuestion from "../models/ViewedQuestion";
import { getToken  } from "next-auth/jwt";
import mongoose from "mongoose";


// _______________________________________________________________
// add question
export const addQuestion = async (req, res) => {
  //todo: activate the auth checks
  // if (!(await IsLoggedIn(req))) {
  //   res.status(400).send({ message: "User Not Logged In!" });
  //   return;
  // }

  if (!req.body) {
    res.status(400).send({ message: "request empty!!", data: req.body });
    return;
  }


  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const files = req.body.files 

  const question = new questionModel({
    title: req.body.title,
    question: req.body.question,
    creator: req.body.fullName ? req.body.fullName : req.body.creator,
    tags: req.body.tags?.split(","),
    module: req.body?.module,
    files: files,
    creatorEmail: req.body.creatorEmail
      ? req.body.creatorEmail
      : req.body.fullName,
  });
  question
    .save()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "some errors occured",
      });
    });
};

// delete one question by id
export const deleteQuestion = async (req, res) => {
  if (!(await IsLoggedIn(req))) {
    res.status(400).send({ message: "User Not Logged In!" });
    return;
  }
  const id = req.query.id;
  questionModel
    .findById(id)
    .then((question) => {
      question.answers.map((answer) => {
        answerModel.findByIdAndDelete(answer).then((ans) => {
          if (!ans) {
            console.log({ message: "cant delete this question" });
          } else {
            console.log("answer deleted!!");
          }
        });
      });
      questionModel.findByIdAndDelete(id).then((data) => {
        if (!data) {
          res.status(404).send({ message: `can not delete message ${id}` });
        } else {
          res.send("Message deleted succesfully!!");
        }
      });
    })

    .catch((err) => {
      res.status(400).send({ message: err.message || "error occured!" });
    });
};

// update one question by id
export const updateQuestion = (req, res) => {
  if (!req.body) {
    res.status(400).send("body empty !!");
    return;
  }

  const id = req.query.id;

  questionModel
    .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `can not update question ${id}` });
      } else {
        res.send(data);
      }
    })
    .catch((err) =>
      res.status(400).send({ massage: err.message || "error occured !!" })
    );
};

// Get question by id
export const findOneQuestion = async (req, res) => {
  const id = req.query.id;
  console.log(id);

  try {
    // Fetch the question details
    const question = await questionModel.findById(id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Count the votes for the question
    const voteCount = await userQuestionsActions.aggregate([
      { $match: { questionId: id } },
      {
        $group: {
          _id: "$questionId",
          totalVotes: { $sum: "$note" },
        },
      },
    ]);

    const totalVotes = voteCount.length > 0 ? voteCount[0].totalVotes : 0;

    // Combine the question details and the vote count
    const response = {
      ...question.toObject(),
      totalVotes,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all questions
export const findQuestion = async (req, res) => {
  try {
    let userEmail = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

    userEmail = userEmail ? userEmail : "";

    // First, get viewed question IDs for this user
    const viewedQuestions = await ViewedQuestion.find({
      userId: userEmail.id
    }).select('questionId -_id');
    // console.log("user id is :",userEmail);
    console.log("viewed questions are :",viewedQuestions);

    const viewedQuestionIds = viewedQuestions.map(vq => 
      new mongoose.Types.ObjectId(vq.questionId)
    );

    const questionsWithActions = await questionModel.aggregate([
      // {
      //   $match: {
      //     _id: { $nin: viewedQuestionIds }
      //   }
      // },
      {
        $lookup: {
          from: "userquestionsactions",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $addFields: { questionId: { $toObjectId: "$questionId" } },
            },
            {
              $match: {
                $expr: { $eq: ["$questionId", "$$questionId"] },
                userId: userEmail.email, 
                saved: true,
              },
            },
          ],
          as: "actions",
        },
      },
      {
        $addFields: {
          saved: { $cond: [{ $eq: [{ $size: "$actions" }, 1] }, true, false] },
        },
      },
      {
        $lookup: {
          from: "userquestionsactions",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $addFields: { questionId: { $toObjectId: "$questionId" } },
            },
            {
              $match: {
                $expr: { $eq: ["$questionId", "$$questionId"] },
                // userId: userEmail.email, // Assuming you have the user's ID in userEmail.email
              },
            },
          ],
          as: "notes",
        },
      },
      {
        $unwind: {
          path: "$notes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "userquestionsactions",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $addFields: { questionId: { $toObjectId: "$questionId" } },
            },
            {
              $match: {
                $expr: { $eq: ["$questionId", "$$questionId"] },
                userId: userEmail.email, // Assuming you have the user's ID in userEmail.email
              },
            },
          ],
          as: "userNote",
        },
      },
      {
        $unwind: {
          path: "$userNote",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          question: { $first: "$question" },
          creator: { $first: "$creator" },
          creatorEmail: { $first: "$creatorEmail" },
          tags: { $first: "$tags" },
          files: { $first: "$files" },
          createdAt: { $first: "$createdAt" },
          answers: { $first: "$answers" },
          saved: { $first: "$saved" },
          sumNotes: { $sum: "$notes.note" }, // Calculate the sum of notes for the current user
          userNote: { $first: "$userNote.note" },
        },
      },
      {
        $addFields: {
          viewed: { $in: ["$_id", viewedQuestionIds] },
        },
      },
    ]);

    // console.log(questionsWithActions);

    res.send(questionsWithActions);
  } catch (err) {
    res.status(400).send({ message: err.message || "An error occurred!" });
  }
};

export const test = (req, res) => {
  res.send("this is working from the tast function ! ");
};

// find all the answers of the question
export const findQuestionsAnswers = async (req, res) => {
  const id = req.query.id;
  var table = [];
  questionModel
    .findById(id)
    .then((question) => {
      answerModel.find({ question: question._id }, (err, answers) => {
        console.log(answers);
        res.send(answers);
      });
    })
    .catch((err) => res.send(err.message));
};

const getAnswers = (question) => {
  var repose = [];
  var queue = Promise.resolve();
  question.answers.map((answerID) => {
    queue = queue.then(() => {
      answerModel.findById(answerID).then((answer) => {
        repose.push(answer);
      });
    });
  });
  queue.then(() => {
    return repose;
  });
};

export const findUserQuestions = (req, res) => {
  const email = req.query.id;
  questionModel
    .find({ creatorEmail: email })
    .then((question) => res.send(question))
    .catch((err) =>
      res.status(400).send({ message: err.message || "error occured !!" })
    );
};

export const updateLikes = async (req, res) => {
  if (!(await IsLoggedIn(req))) {
    res.status(400).send({ message: "User Not Logged In!" });
    return;
  }
  const id = req.query.id;
  questionModel
    .findOneAndUpdate(
      {
        _id: id,
      },
      {
        $inc: {
          likeCount: req.body.addedValue,
        },
      }
    )
    .then((question) => res.send(question))
    .catch((err) => res.send(err.message));
};

// The serch function:
export const seachQuestions = (req, res) => {
  const searchQuery = req.query.searchQuery;
  console.log("this is ====>", searchQuery);
  const query = { $text: { $search: searchQuery } };

  // Return only the `title` of each matched document
  // find documents based on our query and projection
  questionModel
    .find(query, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .then((questions) => res.send(questions))
    .catch((err) => res.send(err.message));
};

export const trackViewedQuestion = async (req, res) => {
  const { userId, questionId } = req.body;
  try {
    await ViewedQuestion.findOneAndUpdate(
      { userId, questionId },
      { $set: { viewedAt: new Date() } },
      { upsert: true }
    );
    res.status(200).json({ message: 'Question viewed successfully' });
  } catch (error) {
    console.error('Error tracking viewed question:',error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//TODO : use it after
export const cleanupOldViewedRecords = async (daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    await ViewedQuestion.deleteMany({
      viewedAt: { $lt: cutoffDate }
    });
  } catch (error) {
    console.error('Error cleaning up old records:');
    throw error;
  }
};
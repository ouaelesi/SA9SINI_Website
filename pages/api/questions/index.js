import dbConnection from "../../../utils/dbConnect";
import { findQuestion, addQuestion } from "../../../controlers/questions";

dbConnection();
const ques = async (req, res) => {
  const method = req.method;

  switch (method) {
    case "GET":
      try {
        findQuestion(req, res);
      } catch (err) {
        res.status(400).send("eroor");
      }
      break;
    case "POST":
      addQuestion(req, res);
      break;
  }
};

export default ques;

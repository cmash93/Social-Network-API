const { User, Thought } = require('../models');

module.exports = {

    getThoughts(req, res) {
        Thought.find()
        .then((thoughts) => res.json(thoughts))
        .catch((err) => {
            console.log(err)
            res.status(500).json(err)
        })
    },

    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
        .then((thought) => 
            !thought
            ? res.status(404).json({ message: 'No thought found.' })
            : res.json(thought)
        )
        .catch((err) => res.status(500).json(err));
    },

    createThought(req, res) {
        Thought.create(req.body)
        .then((thought) => {
            return User.findOneAndUpdate(
                { _id: req.body.userId },
                { $addToSet: { thoughts: thought._id } },
                { new: true }
            )
        })
        .then((user) => 
            !user
            ? res.status(404).json({ message: 'Thought created but no user found.' })
            : res.json({ message: 'Thought successfully created!' })
        )
        .catch((err) => {
            console.log(err);
            return res.status(500).json(err);
        });
    },

    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
        .then((thought) =>
            !thought
            ? res.status(404).json({ message: 'No thought found.' })
            : res.json(thought)
        )
        .catch((err) => res.status(500).json(err))
    },

    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
        .then((thought) => {
            if (!thought) {
                return res.status(404).json({ message: 'No thought found.' })
            }

            return User.findOneAndUpdate(
                { thoughts: req.params.thoughtId },
                { $pull: {thoughts: req.params.thoughtId } },
                { new: true }
            )
        })
        .then((user) => 
            !user
            ? res.status(404).json({ message: 'No user found'})
            : res.json({ message: 'Thought successfully deleted.' })
        )
        .catch((err) => res.status(500).json(err))
    },

    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { new: true }
        )
        .then((thought) =>
            !thought
            ? res.status(404).json({ message: 'No thought found.' })
            : res.json(thought)
        )
        .catch((err) => res.status(500).json(err))
    },

    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { new: true }
        )
        .then((thought) =>
            !thought
            ? res.status(404).json({ message: 'No thought or reaction found matching that ID.' })
            : res.json({ message: 'Reaction successfully deleted!' })
        )
        .catch((err) => res.status(500).json(err))
    }
}
import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    playlistBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

playlistSchema.plugin(mongooseAggregatePaginate)

export const Playlist=mongoose.model("Playlist",playlistSchema)
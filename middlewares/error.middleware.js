import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            success: err.success,
            data: err.data
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [],
        data: null
    });
};

export { errorHandler };

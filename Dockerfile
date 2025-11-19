# Use AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies required by WeasyPrint
RUN dnf install -y \
    cairo \
    pango \
    gdk-pixbuf2 \
    libffi \
    && dnf clean all

# Copy requirements file
COPY requirements.txt ${LAMBDA_TASK_ROOT}/

# Install Python dependencies
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy Lambda function files
COPY lambda_function.py ${LAMBDA_TASK_ROOT}/
COPY invoice_template.py ${LAMBDA_TASK_ROOT}/
COPY packing_slip_template.py ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD [ "lambda_function.lambda_handler" ]

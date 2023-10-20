import torch


def check_cuda_availability():
    cuda_available = torch.cuda.is_available()
    if cuda_available:
        print("CUDA is available!")
        print(f"Number of GPUs available: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            print(f"Device {i}: {torch.cuda.get_device_name(i)}")
    else:
        print("CUDA is not available.")


if __name__ == "__main__":
    check_cuda_availability()
